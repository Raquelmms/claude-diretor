import React from 'react';
import {OffthreadVideo, Freeze, staticFile, useCurrentFrame, spring} from 'remotion';
import {loadFont as anton} from '@remotion/google-fonts/Anton';
import {loadFont as caveat} from '@remotion/google-fonts/Caveat';
import {loadFont as figtree} from '@remotion/google-fonts/Figtree';
import {loadFont as plexMono} from '@remotion/google-fonts/IBMPlexMono';
import {loadFont as tiltNeon} from '@remotion/google-fonts/TiltNeon';
import {loadFont as neonderthaw} from '@remotion/google-fonts/Neonderthaw';
import {loadFont as monoton} from '@remotion/google-fonts/Monoton';
import {loadFont as sora} from '@remotion/google-fonts/Sora';
import {loadFont as archivoBlack} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as manrope} from '@remotion/google-fonts/Manrope';
import {loadFont as playfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as bungee} from '@remotion/google-fonts/Bungee';
import {loadFont as spaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as vt323} from '@remotion/google-fonts/VT323';
import {loadFont as marker} from '@remotion/google-fonts/PermanentMarker';
import plano from './dados/plano.json';

const L = {subsets: ['latin' as const]};
export const FONTES = {
  anton: anton('normal', {weights: ['400'], ...L}).fontFamily,
  caveat: caveat('normal', {weights: ['700'], ...L}).fontFamily,
  figtree: figtree('normal', {weights: ['600', '800'], ...L}).fontFamily,
  plexMono: plexMono('normal', {weights: ['500'], ...L}).fontFamily,
  tiltNeon: tiltNeon('normal', {weights: ['400'], ...L}).fontFamily,
  neonderthaw: neonderthaw('normal', {weights: ['400'], ...L}).fontFamily,
  monoton: monoton('normal', {weights: ['400'], ...L}).fontFamily,
  sora: sora('normal', {weights: ['600', '800'], ...L}).fontFamily,
  archivoBlack: archivoBlack('normal', {weights: ['400'], ...L}).fontFamily,
  manrope: manrope('normal', {weights: ['600', '800'], ...L}).fontFamily,
  playfair: playfair('italic', {weights: ['800'], ...L}).fontFamily,
  bungee: bungee('normal', {weights: ['400'], ...L}).fontFamily,
  spaceGrotesk: spaceGrotesk('normal', {weights: ['600', '700'], ...L}).fontFamily,
  vt323: vt323('normal', {weights: ['400'], ...L}).fontFamily,
  marker: marker('normal', {weights: ['400'], ...L}).fontFamily,
};

/* ------------------------------------------------------------------ */
/* Temas: trocam fontes, cores e o vidro de todos os efeitos de uma vez */
/* ------------------------------------------------------------------ */
type Tema = {
  titulo: string; ui: string; mono: string; mao: string;
  cor: {destaque: string; amarelo: string; vermelho: string; verde: string};
  vidro: {fundo: string; borda: string; texto: string; raio: number; brilho: string};
  /** Sombra extra nos títulos grandes (o neon usa para brilhar). */
  sombraTitulo: string;
  legenda: EstiloLegenda;
};
export type EstiloLegenda = 'forte' | 'neon' | 'editorial' | 'manuscrito' | 'minimo';

const TEMAS: Record<string, Tema> = {
  padrao: {
    titulo: FONTES.anton, ui: FONTES.figtree, mono: FONTES.plexMono, mao: FONTES.caveat,
    cor: {destaque: '#e07a4f', amarelo: '#ffd23f', vermelho: '#ff3b5c', verde: '#6fcf8a'},
    vidro: {fundo: 'rgba(28,26,34,.42)', borda: 'rgba(255,255,255,.35)', texto: '#fff', raio: 44, brilho: 'none'},
    sombraTitulo: 'none', legenda: 'forte',
  },
  neon: {
    titulo: FONTES.tiltNeon, ui: FONTES.sora, mono: FONTES.vt323, mao: FONTES.neonderthaw,
    cor: {destaque: '#ff3df2', amarelo: '#3ff3ff', vermelho: '#ff2d6f', verde: '#39ff88'},
    vidro: {fundo: 'rgba(12,6,30,.6)', borda: 'rgba(255,61,242,.75)', texto: '#fff', raio: 36, brilho: '0 0 26px rgba(255,61,242,.55)'},
    sombraTitulo: '0 0 10px #fff, 0 0 30px #ff3df2, 0 0 60px #ff3df2', legenda: 'neon',
  },
  limpo: {
    titulo: FONTES.archivoBlack, ui: FONTES.manrope, mono: FONTES.spaceGrotesk, mao: FONTES.caveat,
    cor: {destaque: '#2f6bff', amarelo: '#ffe14d', vermelho: '#ff4d5e', verde: '#22c55e'},
    vidro: {fundo: 'rgba(255,255,255,.78)', borda: 'rgba(255,255,255,.95)', texto: '#111', raio: 40, brilho: 'none'},
    sombraTitulo: 'none', legenda: 'minimo',
  },
  editorial: {
    titulo: FONTES.playfair, ui: FONTES.manrope, mono: FONTES.plexMono, mao: FONTES.marker,
    cor: {destaque: '#d7263d', amarelo: '#f3e3c3', vermelho: '#d7263d', verde: '#9bc59d'},
    vidro: {fundo: 'rgba(20,16,12,.58)', borda: 'rgba(243,227,195,.45)', texto: '#fbf6ec', raio: 14, brilho: 'none'},
    sombraTitulo: '0 4px 24px rgba(0,0,0,.35)', legenda: 'editorial',
  },
  retro: {
    titulo: FONTES.bungee, ui: FONTES.spaceGrotesk, mono: FONTES.vt323, mao: FONTES.marker,
    cor: {destaque: '#ff6b35', amarelo: '#ffd23f', vermelho: '#e63946', verde: '#2ec4b6'},
    vidro: {fundo: 'rgba(36,22,10,.55)', borda: 'rgba(255,210,63,.7)', texto: '#fff8e7', raio: 10, brilho: '6px 6px 0 rgba(0,0,0,.35)'},
    sombraTitulo: '5px 5px 0 rgba(0,0,0,.4)', legenda: 'manuscrito',
  },
};
const P = plano as {tema?: string; estiloLegenda?: EstiloLegenda};
export const TEMA: Tema = TEMAS[P.tema ?? 'padrao'] ?? TEMAS.padrao;
export const ESTILO_LEGENDA: EstiloLegenda = P.estiloLegenda ?? TEMA.legenda;

// Nomes que os efeitos usam. Vêm do tema escolhido no plano.
export const TITULO = TEMA.titulo;
export const UI = TEMA.ui;
export const MONO = TEMA.mono;
export const MAO = TEMA.mao;
export const COR = TEMA.cor;

export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);
export const VIDEO = staticFile('base.mp4');
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

/** Estilo de vidro do tema (fundo, borda, cor do texto, cantos e brilho). */
export const vidro = (raio = TEMA.vidro.raio): React.CSSProperties => ({
  color: TEMA.vidro.texto, background: TEMA.vidro.fundo, backdropFilter: 'blur(28px) saturate(1.6)',
  border: `2px solid ${TEMA.vidro.borda}`, borderRadius: raio,
  boxShadow: `0 26px 60px rgba(0,0,0,.28), inset 0 2px 0 rgba(255,255,255,.5)${TEMA.vidro.brilho === 'none' ? '' : ', ' + TEMA.vidro.brilho}`,
});

/** Card de vidro que entra com mola e flutua. */
export const Glass: React.FC<{at: number; i?: number; style: React.CSSProperties; children: React.ReactNode}> = ({at, i = 0, style, children}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - F(at), fps: FPS, config: {damping: 13, stiffness: 160}});
  const bob = Math.sin((f / FPS) * 1.8 + i * 1.3) * 10;
  return (
    <div style={{position: 'absolute', padding: 30, ...vidro(),
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
