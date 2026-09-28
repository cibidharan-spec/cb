"""Cut 7 bars of the song from its first downbeat and lay the UI sounds on top.

Each sound is synthesized, then its peak is *measured* (argmax of a 1 ms RMS envelope)
and the sound is placed so that peak lands exactly on its beat. Tails that run past the
loop point wrap to the start, so the audio loops as cleanly as the picture.
"""
import json, subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
import imageio_ffmpeg

SR = 48000
rng = np.random.default_rng(3)
beats = json.load(open("audio/beats.json"))
cues = json.load(open("audio/cues.json"))
B, START = beats["beat"], beats["start"]
DUR = cues["beats"] * B
N = int(round(DUR * SR))


def load(path):
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    raw = subprocess.run([ff, "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1.0) * np.exp(-t / d)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def tone(f, dur, a, d, f_end=None):
    n = int(dur * SR)
    fr = np.full(n, f) if f_end is None else np.geomspace(f, f_end, n)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, a, d)


def noise(dur, a, d, lo, hi):
    n = int(dur * SR)
    return bp(rng.standard_normal(n), lo, hi) * env(n, a, d)


def lay(*parts):
    """sum (gain, signal) parts of different lengths"""
    out = np.zeros(max(len(x) for _, x in parts))
    for g, x in parts:
        out[:len(x)] += g * x
    return out


# a small, consistent palette: dry, short, soft-attack (no zaps, no swooshes)
SOUNDS = {
    "click":  lambda: lay((0.55, noise(0.03, 0.0006, 0.004, 2500, 9000)), (0.5, tone(1900, 0.04, 0.0005, 0.008))),
    "tick":   lambda: lay((0.35, tone(3400, 0.025, 0.0004, 0.004)), (0.15, noise(0.02, 0.0003, 0.002, 4000, 12000))),
    "soft":   lambda: lay((0.22, tone(2600, 0.03, 0.0006, 0.005))),
    "key":    lambda: lay((0.28, noise(0.035, 0.0008, 0.006, 1500, 7000)), (0.18, tone(1200, 0.03, 0.0006, 0.006))),
    "enter":  lambda: lay((0.45, noise(0.04, 0.0008, 0.008, 900, 6000)), (0.35, tone(700, 0.06, 0.001, 0.014))),
    "pop":    lambda: lay((0.5, tone(820, 0.09, 0.002, 0.022, f_end=460))),
    "thunk":  lambda: lay((0.6, tone(170, 0.14, 0.002, 0.04, f_end=110)), (0.2, noise(0.05, 0.001, 0.01, 200, 1500))),
    "detent": lambda: lay((0.3, tone(2200, 0.02, 0.0004, 0.003))),
}


def peak_offset(x):
    w = int(0.001 * SR)
    e = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, "same"))
    return int(np.argmax(e))


song = load(beats["file"])
i0 = int(round(START * SR))
music = song[i0:i0 + N].copy()
if len(music) < N:
    raise SystemExit("song shorter than the loop")
# crossfade the loop seam: what plays just past the end blends into the first 30 ms
xf = int(0.03 * SR)
tail = song[i0 + N:i0 + N + xf]
if len(tail) == xf:
    ramp = np.linspace(0, 1, xf)[:, None]
    music[:xf] = music[:xf] * ramp + tail * (1 - ramp)

fx = np.zeros(N)
report = []
for beat, name in cues["sfx"]:
    s = SOUNDS[name]()
    pk = peak_offset(s)
    at = int(round(beat * B * SR)) - pk          # sample where the sound must start
    idx = (at + np.arange(len(s))) % N            # wrap tails past the loop point
    np.add.at(fx, idx, s)
    report.append(f"{name:6s} beat {beat:>5}: peak {pk / SR * 1000:5.2f} ms into the sound → starts {at / SR:7.4f}s")

mixd = 0.8 * music + 0.55 * fx[:, None]
mixd /= max(1.0, np.max(np.abs(mixd)) / 0.97)
wavfile.write("audio/mix.wav", SR, (mixd * 32767).astype(np.int16))

# verify: every cue's measured peak in the rendered fx track sits on its beat
w = int(0.001 * SR)
e = np.sqrt(np.convolve(fx ** 2, np.ones(w) / w, "same"))
errs = []
for beat, _ in cues["sfx"]:
    c = int(round(beat * B * SR)); r = int(0.012 * SR)
    win = np.arange(c - r, c + r) % N
    errs.append(abs(int(np.argmax(e[win])) - r) / SR * 1000)
print("\n".join(report))
print(f"audio/mix.wav  {N / SR:.3f}s  |  cue peak error vs beat: max {max(errs):.2f} ms, mean {np.mean(errs):.2f} ms")
