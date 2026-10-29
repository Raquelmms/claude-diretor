import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONTS, TITLE, FPS, F, COLOR, VIDEO, CAPTION_STYLE} from './common';
import {Orbit, TextMask, FreezeRanking, ContactSheet} from './effects/motion';
import {Widgets, Likes, Checklist, Chart} from './effects/glass';
import {SplitClaude, Cta} from './effects/screen';
import {Neon} from './effects/neon';
import plan from './data/plan.json';
import words from './data/words.json';
import info from './data/info.json';

/** Effect type in plan.json → component. */
const EFFECTS: Record<string, React.FC<any>> = {
  'orbit': Orbit,
  'text-mask': TextMask,
  'widgets': Widgets,
  'freeze-ranking': FreezeRanking,
  'likes': Likes,
  'contact-sheet': ContactSheet,
  'split-claude': SplitClaude,
  'checklist': Checklist,
  'chart': Chart,
  'cta': Cta,
  'neon': Neon,
  'text-behind': (p: any) => <Neon style="solid" {...p} />,
};
/** Effects that keep the captions on screen. */
const WITH_CAPTIONS = new Set(['split-claude', 'neon', 'text-behind']);

type Effect = {type: string; start: number; end: number; [k: string]: any};
type Word = {w: string; s: number; e: number};
const P = plan as {effects: Effect[]; captions?: boolean; sounds?: boolean};
const effects = P.effects.filter(e => {
  if (!EFFECTS[e.type]) console.warn(`Unknown effect in plan: ${e.type}`);
  return EFFECTS[e.type];
});
// Effects that paint a full-screen background go under the others (e.g. the closing CTA on top of them).
const BACKGROUND = new Set(['orbit', 'neon', 'text-behind']);
const ordered = [...effects].sort((a, b) => Number(BACKGROUND.has(b.type)) - Number(BACKGROUND.has(a.type)));

/* ------------------------------------------------------------------ */
/* Word-by-word captions, in 5 styles                                   */
/* ------------------------------------------------------------------ */
const GROUPS: Word[][] = [];
(words as Word[]).forEach((w, i, arr) => {
  const prev = arr[i - 1];
  if (!GROUPS.length || GROUPS[GROUPS.length - 1].length >= 3 || (prev && /[.,!?]$/.test(prev.w))) GROUPS.push([]);
  GROUPS[GROUPS.length - 1].push(w);
});

const STYLES: Record<string, {box: React.CSSProperties; word: (active: boolean) => React.CSSProperties}> = {
  bold: {
    box: {fontFamily: TITLE, fontSize: 92, lineHeight: 1.08, textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill'},
    word: a => ({color: a ? COLOR.yellow : '#fff', transform: `scale(${a ? 1.1 : 1})`}),
  },
  neon: {
    box: {fontFamily: FONTS.tiltNeon, fontSize: 88, lineHeight: 1.1, textTransform: 'uppercase', color: '#fff'},
    word: a => ({color: '#fff', textShadow: `0 0 6px #fff, 0 0 18px ${a ? COLOR.yellow : COLOR.accent}, 0 0 42px ${a ? COLOR.yellow : COLOR.accent}`,
      transform: `scale(${a ? 1.08 : 1})`}),
  },
  editorial: {
    box: {fontFamily: FONTS.playfair, fontStyle: 'italic', fontWeight: 800, fontSize: 84, lineHeight: 1.1, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.55)'},
    word: a => ({color: '#fff', backgroundImage: a ? `linear-gradient(transparent 62%, ${COLOR.accent} 62%, ${COLOR.accent} 90%, transparent 90%)` : 'none'}),
  },
  marker: {
    box: {fontFamily: FONTS.marker, fontSize: 88, lineHeight: 1.1, color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'},
    word: a => ({color: a ? COLOR.yellow : '#fff', transform: `rotate(${a ? -4 : 0}deg) scale(${a ? 1.12 : 1})`}),
  },
  minimal: {
    box: {fontFamily: FONTS.manrope, fontWeight: 800, fontSize: 58, lineHeight: 1.3, color: '#fff'},
    word: a => ({color: '#fff', opacity: a ? 1 : 0.7, background: a ? 'rgba(0,0,0,.55)' : 'transparent', borderRadius: 14, padding: '0 10px'}),
  },
};

const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const active = effects.find(e => t >= e.start && t < e.end);
  if (active && !WITH_CAPTIONS.has(active.type)) return null;
  const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.05 && (i === GROUPS.length - 1 || t < GROUPS[i + 1][0].s - 0.05));
  if (gi < 0) return null;
  const g = GROUPS[gi];
  if (t > g[g.length - 1].e + 0.6) return null;
  const st = STYLES[CAPTION_STYLE] ?? STYLES.bold;
  return (
    <div style={{position: 'absolute', left: 80, width: 838, top: active?.type === 'split-claude' ? 620 : 1290, textAlign: 'center', ...st.box}}>
      {g.map((w, i) => {
        const now = t >= w.s && (i === g.length - 1 || t < g[i + 1].s);
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', ...st.word(now)}}>
            {w.w.replace(/[.,!?]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sound effects: each effect asks for its sounds, at its own times     */
/* ------------------------------------------------------------------ */
type Sound = {t: number; name: string; vol: number};
const soundsFor = (e: Effect): Sound[] => {
  const s = (t: number, name: string, vol = 0.35): Sound => ({t, name, vol});
  const st = e.start;
  switch (e.type) {
    case 'orbit': return [s(st, 'whoosh', 0.3)];
    case 'text-mask': return [s(st, 'pop'), s(e.end - 0.45, 'whoosh', 0.3)];
    case 'widgets': return (e.at ?? [st + 0.1, st + 0.45, st + 0.8, st + 1.15]).map((t: number) => s(t, 'pop', 0.3));
    case 'freeze-ranking': return [s(st, 'click', 0.45), s(st + 0.45, 'pop'), s(st + 0.75, 'pop', 0.3), s(st + 1.0, 'pop', 0.3)];
    case 'likes': return [s(st, 'pop'), s(st + 0.35, 'pop', 0.3), s(st + 0.7, 'pop', 0.3)];
    case 'contact-sheet': return [s(st + 0.88, 'pop'), s(e.end - 0.5, 'whoosh', 0.3)];
    case 'split-claude': {
      const len = e.end - st, typing = e.typeAt ?? st + len * 0.35, send = e.sendAt ?? st + len * 0.7;
      const n = Math.max(1, Math.round((Math.min(typing + 0.97, send - 0.15) - typing) / 0.09));
      return [s(st, 'whoosh', 0.3), ...Array.from({length: n}, (_, k) => s(typing + k * 0.09, 'key', 0.18)),
        s(send, 'pop', 0.3), s(e.doneAt ?? st + len * 0.85, 'ding', 0.3)];
    }
    case 'checklist': return [s(st, 'whoosh', 0.25), ...(e.items ?? []).map((it: any) => s(it.at, 'ding', 0.28)),
      ...(e.doneAt ? [s(e.doneAt, 'pop')] : [])];
    case 'chart': return [s(st, 'pop'), s(e.before?.at ?? st + 0.5, 'whoosh', 0.25), s(e.after?.at ?? st + 2, 'pop')];
    case 'cta': return (e.lines ?? []).map((l: any, k: number) => s(l.at ?? st + k * 0.3, 'pop', 0.38));
    case 'neon': return e.style && e.style !== 'neon' ? [s(st, 'whoosh', 0.3)] : [s(st, 'neon', 0.3)];
    case 'text-behind': return [s(st, 'whoosh', 0.3)];
    default: return [];
  }
};
const SOUNDS: Sound[] = P.sounds === false ? [] : effects.flatMap(soundsFor).filter(x => x.t >= 0 && F(x.t) < info.frames);

export const Director: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={VIDEO} />
    {ordered.map((e, i) => {
      const C = EFFECTS[e.type];
      const from = F(e.start), to = Math.min(info.frames, F(e.end));
      if (to <= from) return null;
      return <Sequence key={i} from={from} durationInFrames={to - from} name={e.type}><C {...e} /></Sequence>;
    })}
    {P.captions !== false && <Captions />}
    {SOUNDS.map((x, i) => (
      <Sequence key={`sound${i}`} from={F(x.t)} durationInFrames={Math.min(40, info.frames - F(x.t))} name={`sound ${x.name}`} layout="none">
        <Audio src={staticFile(`sounds/${x.name}.wav`)} volume={x.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
