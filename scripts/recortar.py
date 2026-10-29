#!/usr/bin/env python3
"""Recorta a pessoa do fundo nos trechos que precisam (efeito "orbita").

Lê remotion/src/dados/plano.json, acha os efeitos que pedem recorte e gera
remotion/public/recorte/f_NNNN.png (PNG com fundo transparente) para cada frame.

Uso: .venv/bin/python scripts/recortar.py
"""
import json
import shutil
import subprocess
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REMOTION = RAIZ / 'remotion'
PRECISAM = {'orbita'}


def main():
    plano = json.loads((REMOTION / 'src/dados/plano.json').read_text())
    info = json.loads((REMOTION / 'src/dados/info.json').read_text())
    fps, total = info['fps'], info['frames']
    faixas = [(round(e['inicio'] * fps), min(total - 1, round(e['fim'] * fps) + 1))
              for e in plano['efeitos'] if e['tipo'] in PRECISAM]
    if not faixas:
        print('Nenhum efeito do plano precisa de recorte.')
        return
    destino = REMOTION / 'public/recorte'
    quadros = RAIZ / 'trabalho/quadros'
    shutil.rmtree(quadros, ignore_errors=True)
    quadros.mkdir(parents=True)
    destino.mkdir(parents=True, exist_ok=True)
    for a, b in faixas:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(REMOTION / 'public/base.mp4'), '-vf',
                        f"select='between(n\\,{a}\\,{b})'", '-fps_mode', 'passthrough', '-start_number', str(a),
                        str(quadros / 'f_%04d.png')], check=True)

    from PIL import Image, ImageFilter
    from rembg import new_session, remove
    sessao = new_session('u2net_human_seg')
    arquivos = sorted(quadros.iterdir())
    for i, f in enumerate(arquivos):
        original = Image.open(f)
        original.convert('RGB').save(destino / f.name.replace('f_', 'q_').replace('.png', '.jpg'), quality=92)
        pessoa = remove(original, session=sessao).convert('RGBA')
        # Afina 2 px a borda para não sobrar contorno claro do fundo.
        pessoa.putalpha(pessoa.getchannel('A').filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2)))
        pessoa.save(destino / f.name)
        if i % 10 == 0:
            print(f'{i}/{len(arquivos)}', flush=True)

    # Garante um PNG para cada frame das faixas (o ffmpeg às vezes pula um).
    for a, b in faixas:
        anterior = None
        for n in range(a, b + 1):
            alvo = destino / f'f_{n:04d}.png'
            if alvo.exists():
                anterior = n
            elif anterior is not None:
                shutil.copy(destino / f'f_{anterior:04d}.png', alvo)
                shutil.copy(destino / f'q_{anterior:04d}.jpg', destino / f'q_{n:04d}.jpg')
    print(f'Recorte pronto: {len(arquivos)} frames em remotion/public/recorte/')


if __name__ == '__main__':
    main()
