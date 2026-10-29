import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';
import {TITLE, UI, MONO, FPS, F, COLOR, CLAMP, Base, Clip, Still, Pop, THEME} from '../common';

/* ------------------------------------------------------------------ */
/* split-claude: Claude receiving the command on top, the person below  */
/* ------------------------------------------------------------------ */
export type SplitClaudeProps = Base & {
  command?: string;
  /** Moments (seconds): attaches the video, starts typing, sends, done. */
  attachAt?: number; typeAt?: number; sendAt?: number; doneAt?: number;
  working?: string; done?: string;
};
export const SplitClaude: React.FC<SplitClaudeProps> = ({start, end, command = '/diretor', attachAt, typeAt, sendAt, doneAt,
  working = 'Editing your video…', done: doneText = 'Done! Your video is edited.'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = end - start;
  const tAttach = (attachAt ?? start + len * 0.15) - start;
  const tType = (typeAt ?? start + len * 0.35) - start;
  const tSend = (sendAt ?? start + len * 0.7) - start;
  const tDone = (doneAt ?? start + len * 0.85) - start;
  const slide = spring({frame: f, fps: FPS, config: {damping: 18}});
  const typed = t < tSend ? command.slice(0, Math.floor(interpolate(t, [tType, Math.min(tType + 0.97, tSend - 0.15)], [0, command.length], CLAMP))) : '';
  const sent = t >= tSend, done = t >= tDone;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, height: 960, overflow: 'hidden'}}>
        <Clip from={F(start)} style={{objectPosition: '50% 30%'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960, background: '#1f1e1c', transform: `translateY(${(1 - slide) * -100}%)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 245, display: 'flex', justifyContent: 'center', gap: 8, fontFamily: UI, fontWeight: 600, fontSize: 30}}>
          <span style={{padding: '8px 26px', color: '#a7a39b'}}>Chat</span>
          <span style={{padding: '8px 26px', borderRadius: 40, background: '#3a3835', color: '#f3f0ea'}}>Code</span>
        </div>
        {sent && (
          <div style={{position: 'absolute', right: 190, top: 345, display: 'flex', gap: 16, alignItems: 'center', background: '#33302b', padding: '16px 24px', borderRadius: 26}}>
            <div style={{width: 54, height: 92, borderRadius: 8, overflow: 'hidden'}}><Still frame={0} /></div>
            <span style={{fontFamily: MONO, fontSize: 34, color: COLOR.accent}}>{command}</span>
          </div>
        )}
        {sent && (
          <div style={{position: 'absolute', left: 60, top: 500, display: 'flex', gap: 18, alignItems: 'center', fontFamily: UI, fontSize: 34, color: '#d9d4cc'}}>
            <div style={{width: 30, height: 30, borderRadius: '50%', border: '5px solid ' + (done ? COLOR.green : '#5a5650'),
              borderTopColor: done ? COLOR.green : COLOR.accent, transform: `rotate(${f * 18}deg)`}} />
            {done ? doneText : working}
          </div>
        )}
        <div style={{position: 'absolute', left: 50, right: 170, top: 790, minHeight: 110, background: '#2b2926', borderRadius: 30, padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 18}}>
          {t >= tAttach && !sent && <div style={{width: 46, height: 78, borderRadius: 8, overflow: 'hidden', flex: 'none'}}><Still frame={0} /></div>}
          <span style={{fontFamily: MONO, fontSize: 36, color: COLOR.accent, whiteSpace: 'nowrap', flex: 1}}>
            {typed}{!sent && <span style={{color: '#f3f0ea', opacity: Math.floor(t * 2) % 2 ? 0 : 1}}>|</span>}
          </span>
          <div style={{width: 64, height: 64, borderRadius: '50%', background: COLOR.accent, flex: 'none', transform: `scale(${t > tSend - 0.06 && t < tSend + 0.09 ? 0.8 : 1})`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 956, height: 8, background: '#fff'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* cta: big tags for the closing call to action ("comment X")          */
/* ------------------------------------------------------------------ */
export type CtaProps = Base & {lines: {text: string; at?: number; style?: 'white' | 'accent' | 'yellow'}[]};
const TAG = {
  white: {bg: '#fff', fg: '#111', size: 104},
  accent: {bg: COLOR.accent, fg: '#fff', size: 150},
  yellow: {bg: COLOR.yellow, fg: '#111', size: 56},
};
export const Cta: React.FC<CtaProps> = ({start, lines}) => {
  let top = 1000;
  return (
    <AbsoluteFill>
      {lines.map((l, i) => {
        const tag = TAG[l.style ?? (i === 0 ? 'white' : i === 1 ? 'accent' : 'yellow')];
        const y = top;
        top += tag.size + 50;
        return (
          <Pop key={i} at={l.at !== undefined ? l.at - start : i * 0.3} style={{left: 70, top: y}}>
            <div style={{fontFamily: TITLE, fontSize: tag.size, lineHeight: 1, background: tag.bg, color: tag.fg, padding: '14px 30px', borderRadius: 22,
              textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: THEME.glass.glow === 'none' ? undefined : THEME.glass.glow}}>{l.text}</div>
          </Pop>
        );
      })}
    </AbsoluteFill>
  );
};
