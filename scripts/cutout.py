#!/usr/bin/env python3
"""Cut the person out of the background where the plan needs it (orbit, neon, text-behind).

Reads remotion/src/data/plan.json, finds the effects that need a cutout and writes,
for each frame, remotion/public/cutout/person_NNNN.png (transparent background) and
frame_NNNN.jpg (the original frame, so the two stay aligned).

Usage: .venv/bin/python scripts/cutout.py
"""
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REMOTION = ROOT / 'remotion'
NEEDS_CUTOUT = {'orbit', 'neon', 'text-behind'}


def main():
    plan = json.loads((REMOTION / 'src/data/plan.json').read_text())
    info = json.loads((REMOTION / 'src/data/info.json').read_text())
    fps, total = info['fps'], info['frames']
    ranges = [(round(e['start'] * fps), min(total - 1, round(e['end'] * fps) + 1))
              for e in plan['effects'] if e['type'] in NEEDS_CUTOUT]
    if not ranges:
        print('No effect in the plan needs a cutout.')
        return
    dest = REMOTION / 'public/cutout'
    frames = ROOT / 'work/frames'
    shutil.rmtree(frames, ignore_errors=True)
    frames.mkdir(parents=True)
    dest.mkdir(parents=True, exist_ok=True)
    for a, b in ranges:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(REMOTION / 'public/base.mp4'), '-vf',
                        f"select='between(n\\,{a}\\,{b})'", '-fps_mode', 'passthrough', '-start_number', str(a),
                        str(frames / '%04d.png')], check=True)

    from PIL import Image, ImageFilter
    from rembg import new_session, remove
    session = new_session('u2net_human_seg')
    files = sorted(frames.iterdir())
    for i, f in enumerate(files):
        original = Image.open(f)
        original.convert('RGB').save(dest / f'frame_{f.stem}.jpg', quality=92)
        person = remove(original, session=session).convert('RGBA')
        # Shrink the edge by 2 px so no light outline of the background is left.
        person.putalpha(person.getchannel('A').filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2)))
        person.save(dest / f'person_{f.stem}.png')
        if i % 10 == 0:
            print(f'{i}/{len(files)}', flush=True)

    # Make sure every frame in the ranges has a file (ffmpeg sometimes skips one).
    for a, b in ranges:
        last = None
        for n in range(a, b + 1):
            if (dest / f'person_{n:04d}.png').exists():
                last = n
            elif last is not None:
                shutil.copy(dest / f'person_{last:04d}.png', dest / f'person_{n:04d}.png')
                shutil.copy(dest / f'frame_{last:04d}.jpg', dest / f'frame_{n:04d}.jpg')
    print(f'Cutout done: {len(files)} frames in remotion/public/cutout/')


if __name__ == '__main__':
    main()
