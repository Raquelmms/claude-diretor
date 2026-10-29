import React from 'react';
import {OffthreadVideo, Freeze, staticFile, useCurrentFrame, spring} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadFigtree} from '@remotion/google-fonts/Figtree';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

export const ANTON = loadAnton('normal', {weights: ['400'], subsets: ['latin']}).fontFamily;
export const HAND = loadCaveat('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;
export const UI = loadFigtree('normal', {weights: ['600', '800'], subsets: ['latin']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['500'], subsets: ['latin']}).fontFamily;

export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);
export const VIDEO = staticFile('base.mp4');
export const COR = {destaque: '#e07a4f', amarelo: '#ffd23f', vermelho: '#ff3b5c', verde: '#6fcf8a'};
export const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const recorte = (n: number) => staticFile(`recorte/f_${String(n).padStart(4, '0')}.png`);
export const quadro = (n: number) => staticFile(`recorte/q_${String(n).padStart(4, '0')}.jpg`);

/** Props que todo efeito recebe do plano. Tempos em segundos do vídeo final. */
export type Base = {inicio: number; fim: number};

/** O vídeo base, sincronizado com o lugar do efeito na linha do tempo. */
export const Clip: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => (
  <OffthreadVideo src={VIDEO} trimBefore={from} muted
    style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />
);

/** Um quadro parado do vídeo base. */
export const Still: React.FC<{frame: number; style?: React.CSSProperties}> = ({frame, style}) => (
  <Freeze frame={Math.max(0, frame)}><Clip from={0} style={style} /></Freeze>
);

/** Mola de 0 a 1 que começa em `at` segundos (tempo local do efeito). */
export const usePop = (at: number, damping = 12) => {
  const f = useCurrentFrame();
  return spring({frame: f - F(at), fps: FPS, config: {damping, stiffness: 190}});
};

export const Pop: React.FC<{at: number; style: React.CSSProperties; children: React.ReactNode; rot?: number}> = ({at, style, children, rot = 0}) => {
  const p = usePop(at);
  return (
    <div style={{position: 'absolute', ...style, opacity: Math.min(1, p * 2),
      transform: `rotate(${rot}deg) scale(${0.55 + 0.45 * p})`, transformOrigin: 'left center'}}>
      {children}
    </div>
  );
};

/** Card de vidro fosco que entra com mola e flutua. */
export const Glass: React.FC<{at: number; i?: number; style: React.CSSProperties; children: React.ReactNode}> = ({at, i = 0, style, children}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - F(at), fps: FPS, config: {damping: 13, stiffness: 160}});
  const bob = Math.sin((f / FPS) * 1.8 + i * 1.3) * 10;
  return (
    <div style={{position: 'absolute', padding: 30, borderRadius: 44, color: '#fff',
      background: 'rgba(28,26,34,.42)', backdropFilter: 'blur(28px) saturate(1.6)', border: '2px solid rgba(255,255,255,.35)',
      boxShadow: '0 26px 60px rgba(0,0,0,.28), inset 0 2px 0 rgba(255,255,255,.6)',
      opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 60 + bob}px) scale(${0.7 + 0.3 * p})`, ...style}}>
      {children}
    </div>
  );
};

export const Coracao: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 4.2 2.6h2c.6-1.5 2.1-2.6 4.2-2.6 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
  </svg>
);

export const Check: React.FC<{size?: number}> = ({size = 32}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#0b2a14" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
