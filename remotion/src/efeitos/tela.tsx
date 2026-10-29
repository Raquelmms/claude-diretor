import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring} from 'remotion';
import {ANTON, UI, MONO, FPS, F, COR, CL, Base, Clip, Still, Pop} from '../comum';

/* ------------------------------------------------------------------ */
/* split-claude: em cima o Claude recebendo o comando, embaixo a pessoa */
/* ------------------------------------------------------------------ */
export type SplitClaudeProps = Base & {
  comando?: string;
  /** Momentos (segundos): anexa o vídeo, começa a digitar, envia, fica pronto. */
  anexoEm?: number; digitaEm?: number; enviaEm?: number; prontoEm?: number;
  editando?: string; pronto?: string;
};
export const SplitClaude: React.FC<SplitClaudeProps> = ({inicio, fim, comando = '/diretor', anexoEm, digitaEm, enviaEm, prontoEm,
  editando = 'Editando seu vídeo…', pronto = 'Pronto! Seu vídeo está editado.'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = fim - inicio;
  const tm = (anexoEm ?? inicio + len * 0.15) - inicio;
  const td = (digitaEm ?? inicio + len * 0.35) - inicio;
  const te = (enviaEm ?? inicio + len * 0.7) - inicio;
  const tp = (prontoEm ?? inicio + len * 0.85) - inicio;
  const slide = spring({frame: f, fps: FPS, config: {damping: 18}});
  const typed = t < te ? comando.slice(0, Math.floor(interpolate(t, [td, Math.min(td + 0.97, te - 0.15)], [0, comando.length], CL))) : '';
  const sent = t >= te, done = t >= tp;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, height: 960, overflow: 'hidden'}}>
        <Clip from={F(inicio)} style={{objectPosition: '50% 30%'}} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960, background: '#1f1e1c', transform: `translateY(${(1 - slide) * -100}%)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 245, display: 'flex', justifyContent: 'center', gap: 8, fontFamily: UI, fontWeight: 600, fontSize: 30}}>
          <span style={{padding: '8px 26px', color: '#a7a39b'}}>Chat</span>
          <span style={{padding: '8px 26px', borderRadius: 40, background: '#3a3835', color: '#f3f0ea'}}>Code</span>
        </div>
        {sent && (
          <div style={{position: 'absolute', right: 190, top: 345, display: 'flex', gap: 16, alignItems: 'center', background: '#33302b', padding: '16px 24px', borderRadius: 26}}>
            <div style={{width: 54, height: 92, borderRadius: 8, overflow: 'hidden'}}><Still frame={0} /></div>
            <span style={{fontFamily: MONO, fontSize: 34, color: COR.destaque}}>{comando}</span>
          </div>
        )}
        {sent && (
          <div style={{position: 'absolute', left: 60, top: 500, display: 'flex', gap: 18, alignItems: 'center', fontFamily: UI, fontSize: 34, color: '#d9d4cc'}}>
            <div style={{width: 30, height: 30, borderRadius: '50%', border: '5px solid ' + (done ? COR.verde : '#5a5650'),
              borderTopColor: done ? COR.verde : COR.destaque, transform: `rotate(${f * 18}deg)`}} />
            {done ? pronto : editando}
          </div>
        )}
        <div style={{position: 'absolute', left: 50, right: 170, top: 790, minHeight: 110, background: '#2b2926', borderRadius: 30, padding: '18px 24px',
          display: 'flex', alignItems: 'center', gap: 18}}>
          {t >= tm && !sent && <div style={{width: 46, height: 78, borderRadius: 8, overflow: 'hidden', flex: 'none'}}><Still frame={0} /></div>}
          <span style={{fontFamily: MONO, fontSize: 36, color: COR.destaque, whiteSpace: 'nowrap', flex: 1}}>
            {typed}{!sent && <span style={{color: '#f3f0ea', opacity: Math.floor(t * 2) % 2 ? 0 : 1}}>|</span>}
          </span>
          <div style={{width: 64, height: 64, borderRadius: '50%', background: COR.destaque, flex: 'none', transform: `scale(${t > te - 0.06 && t < te + 0.09 ? 0.8 : 1})`}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 956, height: 8, background: '#fff'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* cta: etiquetas grandes da chamada final ("comenta X")               */
/* ------------------------------------------------------------------ */
export type CtaProps = Base & {linhas: {texto: string; em?: number; estilo?: 'branco' | 'destaque' | 'amarelo'}[]};
const ESTILO = {
  branco: {bg: '#fff', fg: '#111', size: 104},
  destaque: {bg: COR.destaque, fg: '#fff', size: 150},
  amarelo: {bg: COR.amarelo, fg: '#111', size: 56},
};
export const Cta: React.FC<CtaProps> = ({inicio, linhas}) => {
  let top = 1000;
  return (
    <AbsoluteFill>
      {linhas.map((l, i) => {
        const e = ESTILO[l.estilo ?? (i === 0 ? 'branco' : i === 1 ? 'destaque' : 'amarelo')];
        const y = top;
        top += e.size + 50;
        return (
          <Pop key={i} at={l.em !== undefined ? l.em - inicio : i * 0.3} style={{left: 70, top: y}}>
            <div style={{fontFamily: ANTON, fontSize: e.size, lineHeight: 1, background: e.bg, color: e.fg, padding: '14px 30px', borderRadius: 22,
              textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{l.texto}</div>
          </Pop>
        );
      })}
    </AbsoluteFill>
  );
};
