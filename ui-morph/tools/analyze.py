"""Measure the beat grid of audio/song.* and pick the first real downbeat.

Writes audio/beats.json: { bpm, beat, start, beats[], downbeats[], drift_ms }
The animation reads `beat` (seconds per beat); the mixer cuts the song at `start`.
"""
import glob, json, subprocess, sys
import numpy as np
import imageio_ffmpeg

SR = 22050
HOP = 256


def load(path):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    raw = subprocess.run([ff, "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)


def stft_mag(x, n=1024):
    win = np.hanning(n)
    frames = np.lib.stride_tricks.sliding_window_view(np.pad(x, (n // 2, n // 2)), n)[::HOP]
    return np.abs(np.fft.rfft(frames * win, axis=1))


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else sorted(glob.glob("audio/song.*"))[0]
    x = load(path)
    S = np.log1p(100 * stft_mag(x))
    freqs = np.fft.rfftfreq(1024, 1 / SR)
    flux = np.maximum(0, np.diff(S, axis=0, prepend=S[:1])).sum(1)
    low = np.maximum(0, np.diff(S[:, freqs < 150], axis=0, prepend=S[:1, freqs < 150])).sum(1)
    onset = flux - np.convolve(flux, np.ones(16) / 16, "same")
    onset = np.maximum(onset, 0)
    fps = SR / HOP

    # tempo: autocorrelation peak in 90..160 BPM, refined with parabolic interpolation
    ac = np.correlate(onset, onset, "full")[len(onset) - 1:]
    lags = np.arange(len(ac))
    lo, hi = int(fps * 60 / 160), int(fps * 60 / 90)
    k = lo + np.argmax(ac[lo:hi])
    a, b_, c = ac[k - 1], ac[k], ac[k + 1]
    k = k + 0.5 * (a - c) / (a - 2 * b_ + c)
    period = k / fps

    # fine-tune period + phase with a comb over the whole track
    best = (-1, period, 0)
    for p in np.linspace(period * 0.995, period * 1.005, 41):
        for ph in np.linspace(0, p, 200, endpoint=False):
            idx = np.round((ph + np.arange(0, len(x) / SR - ph, p)) * fps).astype(int)
            idx = idx[idx < len(onset)]
            s = onset[idx].mean()
            if s > best[0]:
                best = (s, p, ph)
    _, period, phase = best

    # the comb can't tell beats from off-beats (hats are loud); the kick lives in the low band
    def low_at(ph):
        idx = np.round((ph + np.arange(0, len(x) / SR - ph, period)) * fps).astype(int)
        return low[idx[idx < len(low)]].mean()
    if low_at((phase + period / 2) % period) > low_at(phase):
        phase = (phase + period / 2) % period
    grid = phase + np.arange(0, len(x) / SR - phase, period)

    # sample-accurate phase: median offset of each beat's transient (first crossing of 50% of the
    # local low-passed envelope peak) from the frame-quantized grid
    lp = np.convolve(np.abs(x), np.ones(int(0.002 * SR)) / int(0.002 * SR), "same")
    offs, idxs = [], []
    for n, g in enumerate(grid):
        i0, i1 = int((g - 0.03) * SR), int((g + 0.03) * SR)
        if i0 < 0 or i1 > len(lp):
            continue
        seg = lp[i0:i1]
        if seg.max() > 4 * np.median(lp):
            offs.append((i0 + np.argmax(seg > 0.5 * seg.max())) / SR - g)
            idxs.append(n)
    if len(offs) >= 8:  # fit offset = a + b*n  → corrects both phase and period
        b, a = np.polyfit(idxs, offs, 1)
        phase, period = phase + a, period + b
        grid = phase + np.arange(0, len(x) / SR - phase, period)
    grid = grid[grid + period <= len(x) / SR]

    # measured transient per beat (same detector as the phase fit) → drift report
    def transient(g):
        i0, i1 = int((g - 0.03) * SR), int((g + 0.03) * SR)
        seg = lp[max(i0, 0):i1]
        if i0 < 0 or len(seg) == 0 or seg.max() < 4 * np.median(lp):
            return g
        return (i0 + np.argmax(seg > 0.5 * seg.max())) / SR
    measured = np.array([transient(g) for g in grid])

    # downbeat: the beat phase (mod 4) with the most low-end + broadband energy
    # (claps on 2 and 4 are broadband, so raw energy lies; harmonic change marks the bar line)
    band = (freqs > 150) & (freqs < 4000)
    from scipy.ndimage import median_filter
    H = median_filter(S[:, band], size=(int(0.25 * fps) | 1, 1))  # sustained (harmonic) part only
    spans = np.array([H[int(g * fps): max(int((g + period) * fps), int(g * fps) + 1)].mean(0) for g in grid])
    novelty = np.zeros(len(grid))
    for i in range(4, len(grid) - 4):
        novelty[i] = np.abs(spans[i:i + 4].mean(0) - spans[i - 4:i].mean(0)).sum()
    lowe = np.array([low[int(g * fps): int(g * fps) + 4].sum() for g in grid])
    energy = novelty / (novelty.mean() + 1e-9) + 0.25 * lowe / (lowe.mean() + 1e-9)
    rms = np.array([np.sqrt(np.mean(x[int(g * SR): int((g + period) * SR)] ** 2)) for g in grid])
    active = rms > 0.5 * np.median(rms)
    # only score bar lines whose 8-beat window is fully inside the music (intro→music is not a bar change)
    ok = np.array([i >= 4 and i + 4 <= len(grid) and active[i - 4:i + 4].all() for i in range(len(grid))])
    scores = [energy[i::4][ok[i::4]].mean() for i in range(4)]
    d0 = int(np.argmax(scores))
    downs = [i for i in range(d0, len(grid), 4) if active[i]]
    start_i = downs[0]
    start = float(grid[start_i])

    loop = 28 * period
    if start + loop > len(x) / SR:
        sys.exit(f"song too short: need {loop:.2f}s after the downbeat at {start:.2f}s")
    in_loop = (grid >= start - 1e-6) & (grid < start + loop - 1e-6)
    drift = np.abs(measured[in_loop] - grid[in_loop]) * 1000

    res = dict(file=path, bpm=round(60 / period, 3), beat=period, start=start,
               beats=[float(g - start) for g in grid[in_loop]],
               downbeats=[float(grid[i] - start) for i in downs if start <= grid[i] < start + loop],
               drift_ms=dict(max=float(drift.max()), mean=float(drift.mean())))
    json.dump(res, open("audio/beats.json", "w"), indent=1)
    print(f"{path}: {res['bpm']} BPM, beat {period * 1000:.2f} ms, first downbeat {start:.3f}s, "
          f"loop {loop:.3f}s, drift max {drift.max():.1f} ms / mean {drift.mean():.1f} ms")


if __name__ == "__main__":
    main()
