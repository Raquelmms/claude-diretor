#!/usr/bin/env python3
"""Prepara o vídeo bruto para o diretor.

Corta as pausas e as tomadas repetidas, ajusta a cor (inclusive vídeo HDR de
celular), gera remotion/public/base.mp4 e transcreve a fala já cortada com o
tempo de cada palavra (remotion/src/dados/palavras.json).

Uso:
  .venv/bin/python scripts/preparar.py entrada/meu-video.mov
  .venv/bin/python scripts/preparar.py entrada/meu-video.mov --filtro vivo --glossario "Claude, Remotion"
"""
import argparse
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
REMOTION = RAIZ / 'remotion'
DADOS = REMOTION / 'src' / 'dados'
TRABALHO = RAIZ / 'trabalho'
FPS = 30


def rodar(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def info_video(caminho):
    saida = rodar('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                  'stream=width,height,color_transfer:format=duration', '-of', 'json', str(caminho)).stdout
    j = json.loads(saida)
    s = j['streams'][0]
    return {'largura': s['width'], 'altura': s['height'], 'transfer': s.get('color_transfer', ''),
            'duracao': float(j['format']['duration'])}


def extrair_audio(video, wav):
    rodar('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-map', '0:a:0', '-ac', '1', '-ar', '16000', str(wav))


_modelo = None


def carregar_audio(wav):
    w = wave.open(str(wav))
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def modelo_whisper(nome):
    global _modelo
    from faster_whisper import WhisperModel
    if _modelo is None:
        _modelo = WhisperModel(nome, device='cpu', compute_type='int8')
    return _modelo


def transcrever(wav, modelo, glossario):
    prompt = f'Vocabulário: {glossario}.' if glossario else None
    segs, _ = modelo_whisper(modelo).transcribe(carregar_audio(wav), language='pt', word_timestamps=True, initial_prompt=prompt)
    return [{'w': x.word.strip(), 's': round(x.start, 3), 'e': round(x.end, 3)} for s in segs for x in s.words]


def texto_dos_trechos(wav, cortes, modelo, glossario):
    """Transcreve cada trecho separado. Inteiro, o Whisper costuma juntar duas tomadas numa frase só."""
    audio = carregar_audio(wav)
    prompt = f'Vocabulário: {glossario}.' if glossario else None
    textos = []
    for a, b in cortes:
        segs, _ = modelo_whisper(modelo).transcribe(audio[int(a * 16000):int(b * 16000)], language='pt', initial_prompt=prompt)
        textos.append(' '.join(s.text.strip() for s in segs))
    return textos


def silencios(wav, ruido, minimo):
    log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', f'silencedetect=noise={ruido}:d={minimo}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    marcas = [float(x) for x in re.findall(r'silence_(?:start|end): ([0-9.]+)', log)]
    return [(marcas[i], marcas[i + 1] if i + 1 < len(marcas) else None) for i in range(0, len(marcas), 2)]


def trechos_de_fala(sil, total, antes, depois, junta):
    fala, ant = [], 0.0
    for a, b in sil:
        if a > ant:
            fala.append([ant, a])
        ant = b if b is not None else total
    if ant < total:
        fala.append([ant, total])
    cortes = [[max(0, a - antes), min(total, b + depois)] for a, b in fala if b - a > 0.15]
    unidos = []
    for c in cortes:
        if unidos and c[0] <= unidos[-1][1] + junta:
            unidos[-1][1] = c[1]
        else:
            unidos.append(c)
    return unidos


def normalizar(t):
    return re.sub(r'[^\wà-ú]', '', t.lower())


def tirar_repeticoes(cortes, textos):
    """Se um trecho começa igual ao seguinte (tomada refeita), fica só a última tomada."""
    tokens = [[normalizar(p) for p in t.split() if normalizar(p)] for t in textos]
    finais, removidos = [], []
    for i, c in enumerate(cortes):
        este = tokens[i]
        prox = tokens[i + 1] if i + 1 < len(cortes) else []
        # O Whisper erra palavras de tomadas cortadas no meio ("criei e fiz" x "criei efeitos"),
        # então basta a primeira palavra igual e 2 das 3 primeiras.
        n = min(len(este), len(prox), 3)
        iguais = sum(este[k] == prox[k] for k in range(n))
        if n >= 2 and este[0] == prox[0] and iguais >= 2 and len(este) <= len(prox):
            removidos.append((c, ' '.join(este)))
            continue
        finais.append(c)
    return finais, removidos


def filtro_cor(info, modo):
    hdr = info['transfer'] in ('arib-std-b67', 'smpte2084')
    enquadrar = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
    if hdr and modo == 'vivo':
        return (f"zscale=tin={info['transfer']}:min=bt2020nc:pin=bt2020:t=linear:npl=203,format=gbrpf32le,"
                f"zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,{enquadrar}")
    if modo == 'vivo':
        return f'{enquadrar},eq=saturation=1.3:contrast=1.08'
    return f'{enquadrar},eq=saturation=1.1:contrast=1.04'


def renderizar_base(video, cortes, filtro, saida):
    partes = []
    for i, (a, b) in enumerate(cortes):
        partes.append(f'[0:v:0]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,{filtro},fps={FPS},format=yuv420p[v{i}];'
                      f'[0:a:0]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,'
                      f'afade=t=out:st={max(0, b - a - 0.03):.3f}:d=0.03[a{i}]')
    partes.append(''.join(f'[v{i}][a{i}]' for i in range(len(cortes))) + f'concat=n={len(cortes)}:v=1:a=1[v][a]')
    rodar('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-filter_complex', ';'.join(partes), '-map', '[v]', '-map', '[a]',
          '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-color_primaries', 'bt709', '-color_trc', 'bt709',
          '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(saida))


def contar_frames(video):
    return int(rodar('ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                     'stream=nb_read_frames', '-of', 'csv=p=0', str(video)).stdout.strip())


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('video')
    p.add_argument('--filtro', choices=['natural', 'vivo'], default='natural')
    p.add_argument('--modelo', default='medium', help='modelo do Whisper (small é mais rápido, medium erra menos)')
    p.add_argument('--glossario', default='Claude', help='palavras que o Whisper costuma errar, separadas por vírgula')
    p.add_argument('--ruido', default='-35dB', help='abaixo disso conta como silêncio')
    p.add_argument('--respiro', type=float, default=0.28, help='segundos mantidos depois de cada frase')
    a = p.parse_args()

    video = Path(a.video).resolve()
    TRABALHO.mkdir(exist_ok=True)
    DADOS.mkdir(parents=True, exist_ok=True)
    info = info_video(video)
    print(f"Vídeo: {info['largura']}x{info['altura']}, {info['duracao']:.1f} s, HDR: {info['transfer'] in ('arib-std-b67', 'smpte2084')}")

    print('1/4 Achando as pausas…', flush=True)
    wav = TRABALHO / 'bruto.wav'
    extrair_audio(video, wav)
    cortes = trechos_de_fala(silencios(wav, a.ruido, 0.35), info['duracao'], 0.12, a.respiro, 0.3)

    print('2/4 Procurando tomadas repetidas…', flush=True)
    cortes, removidos = tirar_repeticoes(cortes, texto_dos_trechos(wav, cortes, a.modelo, a.glossario))
    for c, txt in removidos:
        print(f'   tomada repetida removida ({c[0]:.1f}-{c[1]:.1f} s): "{txt}"')
    (TRABALHO / 'cortes.json').write_text(json.dumps(cortes))

    print('3/4 Gerando remotion/public/base.mp4…', flush=True)
    base = REMOTION / 'public' / 'base.mp4'
    renderizar_base(video, cortes, filtro_cor(info, a.filtro), base)

    print('4/4 Transcrevendo o vídeo cortado…', flush=True)
    wav_base = TRABALHO / 'base.wav'
    extrair_audio(base, wav_base)
    palavras = transcrever(wav_base, a.modelo, a.glossario)
    (DADOS / 'palavras.json').write_text(json.dumps(palavras, ensure_ascii=False, indent=0))
    frames = contar_frames(base)
    (DADOS / 'info.json').write_text(json.dumps({'frames': frames, 'fps': FPS}))

    print(f'\nPronto: {frames / FPS:.1f} s ({frames} frames). Fala com o tempo de cada palavra:\n')
    print(' '.join(f"{x['w']}@{x['s']:.2f}" for x in palavras))


if __name__ == '__main__':
    sys.exit(main())
