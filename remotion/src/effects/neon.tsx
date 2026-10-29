import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, spring, interpolate} from 'remotion';
import {FONTS, TITLE, FPS, F, CLAMP, COLOR, personCutout, cutoutFrame, Base} from '../common';

/* ------------------------------------------------------------------ */
/* neon / text-behind: a title behind the person's head (needs cutout)  */
/* ------------------------------------------------------------------ */
export type NeonProps = Base & {
  text: string;
  /** neon = light tube that flickers on; solid = giant letters; outline = stroke only. */
  style?: 'neon' | 'solid' | 'outline';
  /** Neon only: tube (rounded), script (cursive) or retro (double lines). */
  font?: 'tube' | 'script' | 'retro';
  color?: string;
  /** Vertical center of the text in px (of 1920). The default sits behind the head. */
  y?: number;
};

// On/off pattern of a neon tube warming up (1 = lit).
const FLICKER: [number, number][] = [[0, 0], [0.08, 1], [0.14, 0.1], [0.2, 1], [0.26, 0.2], [0.3, 0.2], [0.36, 1], [0.5, 0.35], [0.54, 1]];
const neonLevel = (t: number) => {
  let v = 0;
  for (const [at, val] of FLICKER) if (t >= at) v = val;
  return t > 0.6 ? 0.93 + 0.07 * Math.sin(t * 37) * Math.sin(t * 13) : v;
};

export const Neon: React.FC<NeonProps> = ({start, text, style = 'neon', font = 'tube', color, y = 560}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const n = F(start) + f;
  const len = Math.max(3, text.length);
  const c = color ?? COLOR.accent;

  let layer: React.ReactNode;
  if (style === 'neon') {
    const b = neonLevel(t);
    const family = font === 'script' ? FONTS.neonderthaw : font === 'retro' ? FONTS.monoton : FONTS.tiltNeon;
    const size = Math.min(font === 'script' ? 330 : 270, (font === 'script' ? 2200 : 1750) / len);
    layer = (
      <>
        {/* light spilling on the wall */}
        <div style={{position: 'absolute', left: '50%', top: y, width: 1100, height: 700, transform: 'translate(-50%,-50%)',
          background: `radial-gradient(closest-side, ${c}, transparent)`, opacity: 0.35 * b, mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', left: 40, right: 40, top: y, transform: 'translateY(-50%)', textAlign: 'center',
          fontFamily: family, fontSize: size, lineHeight: 1, whiteSpace: 'nowrap',
          color: b > 0.5 ? '#fff' : c, opacity: 0.25 + 0.75 * b,
          textShadow: b > 0.5 ? `0 0 6px #fff, 0 0 16px ${c}, 0 0 40px ${c}, 0 0 80px ${c}, 0 0 140px ${c}` : 'none'}}>
          {text}
        </div>
      </>
    );
  } else {
    const p = spring({frame: f, fps: FPS, config: {damping: 15, stiffness: 120}});
    // One word per line, sized to the longest line.
    const lines = text.trim().split(/\s+/);
    const size = Math.min(420, 1750 / Math.max(3, ...lines.map(l => l.length)));
    layer = (
      <div style={{position: 'absolute', left: 0, right: 0, top: y - (lines.length - 1) * size * 0.45, textAlign: 'center', fontFamily: TITLE, fontSize: size, lineHeight: 0.9,
        textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
        transform: `translateY(${-50 + (1 - p) * 30}%) scale(${0.85 + 0.15 * p})`, opacity: interpolate(p, [0, 0.4], [0, 1], CLAMP),
        color: style === 'outline' ? 'transparent' : c, WebkitTextStroke: style === 'outline' ? `7px ${c}` : undefined,
        textShadow: style === 'solid' ? '0 20px 60px rgba(0,0,0,.25)' : undefined}}>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    );
  }
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {/* The original frame and the cutout come from the same frame, so they line up. */}
      <Img src={cutoutFrame(n)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      {layer}
      <Img src={personCutout(n)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
