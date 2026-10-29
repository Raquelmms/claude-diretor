#!/usr/bin/env python3
"""Generate the director's sound effects into remotion/public/sounds/.

All of them are synthesized here (sine waves, noise and envelopes), so they carry
no third-party rights. Run it again to change a sound.

Usage: .venv/bin/python scripts/generate_sounds.py
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DEST = Path(__file__).resolve().parent.parent / 'remotion/public/sounds'
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    DEST.mkdir(parents=True, exist_ok=True)
    with wave.open(str(DEST / f'{name}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def low_pass(x, cutoff):
    """One-pole filter, enough to soften noise."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = (1 - a) * x[i] + a * y[i - 1]
    return y


def pop():
    s = t(0.12)
    freq = 520 + 700 * np.exp(-s * 40)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-s * 38)
    click = rng.normal(0, 1, len(s)) * np.exp(-s * 400) * 0.3
    return body + click


def whoosh():
    s = t(0.5)
    noise = rng.normal(0, 1, len(s))
    env = np.sin(np.pi * s / s[-1]) ** 2
    # Sweep the filter cutoff up and back down, like something passing by.
    x = np.zeros_like(noise)
    y = 0.0
    for i, v in enumerate(noise):
        cutoff = 300 + 3500 * np.sin(np.pi * i / len(noise))
        a = np.exp(-2 * np.pi * cutoff / SR)
        y = (1 - a) * v + a * y
        x[i] = y
    return x * env


def ding():
    s = t(1.1)
    note = 1318.5
    x = sum(amp * np.sin(2 * np.pi * note * h * s) * np.exp(-s * dec)
            for h, amp, dec in [(1, 1.0, 4.0), (2.01, 0.45, 6.0), (3.02, 0.2, 9.0), (4.1, 0.08, 12.0)])
    return x * np.minimum(1, s * 400)


def camera_click():
    s = t(0.16)
    x = np.zeros_like(s)
    for start, strength in [(0.0, 1.0), (0.07, 0.7)]:
        m = s >= start
        r = s[m] - start
        x[m] += rng.normal(0, 1, m.sum()) * np.exp(-r * 120) * strength
    return low_pass(x, 5000)


def neon_hum():
    s = t(0.7)
    base = np.sign(np.sin(2 * np.pi * 120 * s)) * 0.3 + np.sin(2 * np.pi * 240 * s) * 0.4
    crackles = (rng.random(len(s)) > 0.9985) * rng.normal(0, 3, len(s))
    env = np.minimum(1, s * 30) * np.exp(-s * 2.5)
    return low_pass(base + crackles, 2500) * env


def key():
    s = t(0.05)
    return low_pass(rng.normal(0, 1, len(s)) * np.exp(-s * 160), 6000) + np.sin(2 * np.pi * 1800 * s) * np.exp(-s * 300) * 0.4


SOUNDS = {'pop': pop, 'whoosh': whoosh, 'ding': ding, 'click': camera_click, 'neon': neon_hum, 'key': key}

if __name__ == '__main__':
    for name, fn in SOUNDS.items():
        save(name, fn())
        print(f'sounds/{name}.wav')
