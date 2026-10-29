#!/usr/bin/env python3
"""Gera os efeitos sonoros do diretor em remotion/public/sons/.

Todos são sintetizados aqui (senoides, ruído e envelopes), então não têm
direitos de terceiros. Rode de novo se quiser mudar algum som.

Uso: .venv/bin/python scripts/gerar_sons.py
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DESTINO = Path(__file__).resolve().parent.parent / 'remotion/public/sons'
rng = np.random.default_rng(7)


def t(dur):
    return np.arange(int(SR * dur)) / SR


def salvar(nome, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    DESTINO.mkdir(parents=True, exist_ok=True)
    with wave.open(str(DESTINO / f'{nome}.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def passa_baixa(x, corte):
    """Filtro de 1 polo, suficiente para suavizar ruído."""
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.zeros_like(x)
    for i in range(1, len(x)):
        y[i] = (1 - a) * x[i] + a * y[i - 1]
    return y


def pop():
    s = t(0.12)
    freq = 520 + 700 * np.exp(-s * 40)
    corpo = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-s * 38)
    clique = rng.normal(0, 1, len(s)) * np.exp(-s * 400) * 0.3
    return corpo + clique


def whoosh():
    s = t(0.5)
    ruido = rng.normal(0, 1, len(s))
    env = np.sin(np.pi * s / s[-1]) ** 2
    # Varre o corte do filtro de baixo para cima e de volta, como algo passando.
    x = np.zeros_like(ruido)
    y = 0.0
    for i, v in enumerate(ruido):
        corte = 300 + 3500 * np.sin(np.pi * i / len(ruido))
        a = np.exp(-2 * np.pi * corte / SR)
        y = (1 - a) * v + a * y
        x[i] = y
    return x * env


def ding():
    s = t(1.1)
    nota = 1318.5
    x = sum(amp * np.sin(2 * np.pi * nota * h * s) * np.exp(-s * dec)
            for h, amp, dec in [(1, 1.0, 4.0), (2.01, 0.45, 6.0), (3.02, 0.2, 9.0), (4.1, 0.08, 12.0)])
    return x * np.minimum(1, s * 400)


def clique_camera():
    s = t(0.16)
    x = np.zeros_like(s)
    for inicio, forca in [(0.0, 1.0), (0.07, 0.7)]:
        m = s >= inicio
        r = s[m] - inicio
        x[m] += rng.normal(0, 1, m.sum()) * np.exp(-r * 120) * forca
    return passa_baixa(x, 5000)


def zumbido_neon():
    s = t(0.7)
    base = np.sign(np.sin(2 * np.pi * 120 * s)) * 0.3 + np.sin(2 * np.pi * 240 * s) * 0.4
    estalos = (rng.random(len(s)) > 0.9985) * rng.normal(0, 3, len(s))
    env = np.minimum(1, s * 30) * np.exp(-s * 2.5)
    return passa_baixa(base + estalos, 2500) * env


def tecla():
    s = t(0.05)
    return passa_baixa(rng.normal(0, 1, len(s)) * np.exp(-s * 160), 6000) + np.sin(2 * np.pi * 1800 * s) * np.exp(-s * 300) * 0.4


SONS = {'pop': pop, 'whoosh': whoosh, 'ding': ding, 'clique': clique_camera, 'neon': zumbido_neon, 'tecla': tecla}

if __name__ == '__main__':
    for nome, fn in SONS.items():
        salvar(nome, fn())
        print(f'sons/{nome}.wav')
