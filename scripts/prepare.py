#!/usr/bin/env python3
"""Prepare the raw video for the director.

Cuts pauses and repeated takes, fixes the color (including HDR phone video),
writes remotion/public/base.mp4 and transcribes the cut speech with the time of
each word (remotion/src/data/words.json).

Usage:
  .venv/bin/python scripts/prepare.py input/my-video.mov
  .venv/bin/python scripts/prepare.py input/my-video.mov --filter vivid --glossary "Claude, Remotion"
"""
import argparse
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
REMOTION = ROOT / 'remotion'
DATA = REMOTION / 'src' / 'data'
WORK = ROOT / 'work'
FPS = 30
HDR_TRANSFERS = ('arib-std-b67', 'smpte2084')


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def video_info(path):
    out = run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
              'stream=width,height,color_transfer:format=duration', '-of', 'json', str(path)).stdout
    j = json.loads(out)
    s = j['streams'][0]
    return {'width': s['width'], 'height': s['height'], 'transfer': s.get('color_transfer', ''),
            'duration': float(j['format']['duration'])}


def extract_audio(video, wav):
    run('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-map', '0:a:0', '-ac', '1', '-ar', '16000', str(wav))


def load_audio(wav):
    w = wave.open(str(wav))
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


_model = None


def whisper(name):
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel(name, device='cpu', compute_type='int8')
    return _model


def detect_language(audio, model):
    _, info = whisper(model).transcribe(audio[:30 * 16000])
    return info.language


def transcribe(wav, model, language, glossary):
    prompt = f'Glossary: {glossary}.' if glossary else None
    segs, _ = whisper(model).transcribe(load_audio(wav), language=language, word_timestamps=True, initial_prompt=prompt)
    return [{'w': x.word.strip(), 's': round(x.start, 3), 'e': round(x.end, 3)} for s in segs for x in s.words]


def text_per_chunk(audio, chunks, model, language, glossary):
    """Transcribe each chunk on its own. On the whole audio, Whisper tends to merge two takes into one sentence."""
    prompt = f'Glossary: {glossary}.' if glossary else None
    texts = []
    for a, b in chunks:
        segs, _ = whisper(model).transcribe(audio[int(a * 16000):int(b * 16000)], language=language, initial_prompt=prompt)
        texts.append(' '.join(s.text.strip() for s in segs))
    return texts


def silences(wav, noise, minimum):
    log = subprocess.run(['ffmpeg', '-i', str(wav), '-af', f'silencedetect=noise={noise}:d={minimum}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    marks = [float(x) for x in re.findall(r'silence_(?:start|end): ([0-9.]+)', log)]
    return [(marks[i], marks[i + 1] if i + 1 < len(marks) else None) for i in range(0, len(marks), 2)]


def speech_chunks(sil, total, before, after, join):
    speech, prev = [], 0.0
    for a, b in sil:
        if a > prev:
            speech.append([prev, a])
        prev = b if b is not None else total
    if prev < total:
        speech.append([prev, total])
    chunks = [[max(0, a - before), min(total, b + after)] for a, b in speech if b - a > 0.15]
    merged = []
    for c in chunks:
        if merged and c[0] <= merged[-1][1] + join:
            merged[-1][1] = c[1]
        else:
            merged.append(c)
    return merged


def normalize(t):
    return re.sub(r'[^\wà-ÿ]', '', t.lower())


def drop_retakes(chunks, texts):
    """If a chunk starts like the next one (a retake), keep only the last take."""
    tokens = [[normalize(p) for p in t.split() if normalize(p)] for t in texts]
    kept, dropped = [], []
    for i, c in enumerate(chunks):
        this = tokens[i]
        nxt = tokens[i + 1] if i + 1 < len(chunks) else []
        # Whisper mishears words of takes cut short ("criei e fiz" vs "criei efeitos"),
        # so the first word matching plus 2 of the first 3 is enough.
        n = min(len(this), len(nxt), 3)
        same = sum(this[k] == nxt[k] for k in range(n))
        if n >= 2 and this[0] == nxt[0] and same >= 2 and len(this) <= len(nxt):
            dropped.append((c, ' '.join(this)))
            continue
        kept.append(c)
    return kept, dropped


def color_filter(info, mode):
    hdr = info['transfer'] in HDR_TRANSFERS
    frame = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
    if hdr and mode == 'vivid':
        return (f"zscale=tin={info['transfer']}:min=bt2020nc:pin=bt2020:t=linear:npl=203,format=gbrpf32le,"
                f"zscale=p=bt709,tonemap=tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,{frame}")
    if mode == 'vivid':
        return f'{frame},eq=saturation=1.3:contrast=1.08'
    return f'{frame},eq=saturation=1.1:contrast=1.04'


def render_base(video, chunks, vfilter, out):
    parts = []
    for i, (a, b) in enumerate(chunks):
        parts.append(f'[0:v:0]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,{vfilter},fps={FPS},format=yuv420p[v{i}];'
                     f'[0:a:0]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,'
                     f'afade=t=out:st={max(0, b - a - 0.03):.3f}:d=0.03[a{i}]')
    parts.append(''.join(f'[v{i}][a{i}]' for i in range(len(chunks))) + f'concat=n={len(chunks)}:v=1:a=1[v][a]')
    run('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-filter_complex', ';'.join(parts), '-map', '[v]', '-map', '[a]',
        '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-colorspace', 'bt709', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', str(out))


def count_frames(video):
    return int(run('ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
                   'stream=nb_read_frames', '-of', 'csv=p=0', str(video)).stdout.strip())


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('video')
    p.add_argument('--filter', choices=['natural', 'vivid'], default='natural')
    p.add_argument('--language', default=None, help='speech language code (pt, en, es…). Detected automatically if omitted')
    p.add_argument('--model', default='medium', help='Whisper model (small is faster, medium makes fewer mistakes)')
    p.add_argument('--glossary', default='Claude', help='words Whisper tends to get wrong, comma separated')
    p.add_argument('--noise', default='-35dB', help='anything quieter counts as silence')
    p.add_argument('--breath', type=float, default=0.28, help='seconds kept after each sentence')
    a = p.parse_args()

    video = Path(a.video).resolve()
    WORK.mkdir(exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)
    info = video_info(video)
    print(f"Video: {info['width']}x{info['height']}, {info['duration']:.1f} s, HDR: {info['transfer'] in HDR_TRANSFERS}")

    print('1/4 Finding pauses…', flush=True)
    wav = WORK / 'raw.wav'
    extract_audio(video, wav)
    audio = load_audio(wav)
    language = a.language or detect_language(audio, a.model)
    print(f'   language: {language}')
    chunks = speech_chunks(silences(wav, a.noise, 0.35), info['duration'], 0.12, a.breath, 0.3)

    print('2/4 Looking for repeated takes…', flush=True)
    chunks, dropped = drop_retakes(chunks, text_per_chunk(audio, chunks, a.model, language, a.glossary))
    for c, txt in dropped:
        print(f'   repeated take removed ({c[0]:.1f}-{c[1]:.1f} s): "{txt}"')
    (WORK / 'cuts.json').write_text(json.dumps(chunks))

    print('3/4 Writing remotion/public/base.mp4…', flush=True)
    base = REMOTION / 'public' / 'base.mp4'
    render_base(video, chunks, color_filter(info, a.filter), base)

    print('4/4 Transcribing the cut video…', flush=True)
    wav_base = WORK / 'base.wav'
    extract_audio(base, wav_base)
    words = transcribe(wav_base, a.model, language, a.glossary)
    (DATA / 'words.json').write_text(json.dumps(words, ensure_ascii=False, indent=0))
    frames = count_frames(base)
    # Seconds in the final video where one chunk jumps to the next (used by cut transitions).
    cuts, t = [], 0.0
    for c0, c1 in chunks[:-1]:
        t += c1 - c0
        cuts.append(round(t, 3))
    (DATA / 'info.json').write_text(json.dumps({'frames': frames, 'fps': FPS, 'language': language, 'cuts': cuts}))

    print(f'\nDone: {frames / FPS:.1f} s ({frames} frames). Speech with the time of each word:\n')
    print(' '.join(f"{x['w']}@{x['s']:.2f}" for x in words))


if __name__ == '__main__':
    sys.exit(main())
