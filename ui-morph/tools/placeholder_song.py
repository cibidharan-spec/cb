"""Synthesize a 120 BPM placeholder track so the pipeline runs end to end.

Replace audio/song.* with the real Mixkit track and re-run analyze.py; nothing
else depends on this file. The intro offset is deliberately off-grid so the
analyzer has to find the first downbeat instead of assuming t=0.
"""
import numpy as np
from scipy.io import wavfile

SR = 44100
BPM = 120.0
BEAT = 60.0 / BPM
INTRO = 1.37          # seconds of pad before the first downbeat
BARS = 10
N = int(SR * (INTRO + BARS * 4 * BEAT + 1.0))
rng = np.random.default_rng(7)
out = np.zeros(N)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1.0) * np.exp(-t / d)


def add(sig, t0, gain=1.0):
    i = int(round(t0 * SR))
    j = min(N, i + len(sig))
    if i < N:
        out[i:j] += gain * sig[: j - i]


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12)


def hat():
    n = int(0.06 * SR)
    x = rng.standard_normal(n)
    x = np.diff(np.concatenate([[0], x]))  # crude high-pass
    return x * env(n, 0.0005, 0.012)


def clap():
    n = int(0.18 * SR)
    x = rng.standard_normal(n)
    e = sum(env(n, 0.0005, 0.008) * (np.arange(n) >= int(k * 0.011 * SR)) for k in range(3))
    return x * (e + env(n, 0.001, 0.05) * 0.6)


def pluck(freq, dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * freq * h * t) / h for h in (1, 2, 3))
    return s * env(n, 0.002, dur / 3)


def stab(freqs):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    return s * env(n, 0.003, 0.18)


bass = [55.0, 73.42, 65.41, 49.0]
chords = [(220, 277.18, 329.63), (293.66, 369.99, 440.0), (261.63, 329.63, 392.0), (196.0, 246.94, 293.66)]

# sustained pad that changes chord on every bar line (intro holds the first chord)
t = np.arange(N) / SR
bar_idx = np.clip(np.floor((t - INTRO) / (4 * BEAT)), 0, None).astype(int) % 4
pad = np.zeros(N)
for c in range(4):
    m = bar_idx == c
    pad[m] = sum(np.sin(2 * np.pi * f * t[m]) for f in chords[c])
out += pad * 0.05 * np.minimum(t / 0.6, 1)
for bar in range(BARS):
    t0 = INTRO + bar * 4 * BEAT
    add(stab(chords[bar % 4]), t0, 0.22)
    for beat in range(4):
        tb = t0 + beat * BEAT
        add(kick(), tb, 0.9)
        add(hat(), tb + BEAT / 2, 0.22)
        if beat in (1, 3):
            add(clap(), tb, 0.25)
        add(pluck(bass[bar % 4] * 2), tb + BEAT / 2, 0.28)

out /= np.max(np.abs(out)) * 1.12
wavfile.write("audio/song.wav", SR, (out * 32767).astype(np.int16))
print(f"wrote audio/song.wav  {N / SR:.2f}s  first downbeat at {INTRO}s")
