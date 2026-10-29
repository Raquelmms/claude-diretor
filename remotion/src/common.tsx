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
import plan from './data/plan.json';

const L = {subsets: ['latin' as const]};
export const FONTS = {
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
/* Themes: swap the fonts, colors and glass of every effect at once     */
/* ------------------------------------------------------------------ */
export type CaptionStyle = 'bold' | 'neon' | 'editorial' | 'marker' | 'minimal';
type Theme = {
  title: string; ui: string; mono: string; hand: string;
  color: {accent: string; yellow: string; red: string; green: string};
  glass: {background: string; border: string; text: string; radius: number; glow: string};
  /** Extra shadow on big titles (the neon theme uses it to glow). */
  titleShadow: string;
  caption: CaptionStyle;
};

const THEMES: Record<string, Theme> = {
  default: {
    title: FONTS.anton, ui: FONTS.figtree, mono: FONTS.plexMono, hand: FONTS.caveat,
    color: {accent: '#e07a4f', yellow: '#ffd23f', red: '#ff3b5c', green: '#6fcf8a'},
    glass: {background: 'rgba(28,26,34,.42)', border: 'rgba(255,255,255,.35)', text: '#fff', radius: 44, glow: 'none'},
    titleShadow: 'none', caption: 'bold',
  },
  neon: {
    title: FONTS.tiltNeon, ui: FONTS.sora, mono: FONTS.vt323, hand: FONTS.neonderthaw,
    color: {accent: '#ff3df2', yellow: '#3ff3ff', red: '#ff2d6f', green: '#39ff88'},
    glass: {background: 'rgba(12,6,30,.6)', border: 'rgba(255,61,242,.75)', text: '#fff', radius: 36, glow: '0 0 26px rgba(255,61,242,.55)'},
    titleShadow: '0 0 10px #fff, 0 0 30px #ff3df2, 0 0 60px #ff3df2', caption: 'neon',
  },
  clean: {
    title: FONTS.archivoBlack, ui: FONTS.manrope, mono: FONTS.spaceGrotesk, hand: FONTS.caveat,
    color: {accent: '#2f6bff', yellow: '#ffe14d', red: '#ff4d5e', green: '#22c55e'},
    glass: {background: 'rgba(255,255,255,.78)', border: 'rgba(255,255,255,.95)', text: '#111', radius: 40, glow: 'none'},
    titleShadow: 'none', caption: 'minimal',
  },
  editorial: {
    title: FONTS.playfair, ui: FONTS.manrope, mono: FONTS.plexMono, hand: FONTS.marker,
    color: {accent: '#d7263d', yellow: '#f3e3c3', red: '#d7263d', green: '#9bc59d'},
    glass: {background: 'rgba(20,16,12,.58)', border: 'rgba(243,227,195,.45)', text: '#fbf6ec', radius: 14, glow: 'none'},
    titleShadow: '0 4px 24px rgba(0,0,0,.35)', caption: 'editorial',
  },
  retro: {
    title: FONTS.bungee, ui: FONTS.spaceGrotesk, mono: FONTS.vt323, hand: FONTS.marker,
    color: {accent: '#ff6b35', yellow: '#ffd23f', red: '#e63946', green: '#2ec4b6'},
    glass: {background: 'rgba(36,22,10,.55)', border: 'rgba(255,210,63,.7)', text: '#fff8e7', radius: 10, glow: '6px 6px 0 rgba(0,0,0,.35)'},
    titleShadow: '5px 5px 0 rgba(0,0,0,.4)', caption: 'marker',
  },
};
const P = plan as {theme?: string; captionStyle?: CaptionStyle};
export const THEME: Theme = THEMES[P.theme ?? 'default'] ?? THEMES.default;
export const CAPTION_STYLE: CaptionStyle = P.captionStyle ?? THEME.caption;

// Shortcuts the effects use. They come from the theme chosen in the plan.
export const TITLE = THEME.title;
export const UI = THEME.ui;
export const MONO = THEME.mono;
export const HAND = THEME.hand;
export const COLOR = THEME.color;

export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);
export const VIDEO = staticFile('base.mp4');
export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Person cut out from the background (transparent PNG) for frame n. */
export const personCutout = (n: number) => staticFile(`cutout/person_${String(n).padStart(4, '0')}.png`);
/** The original frame n that the cutout was made from (keeps both aligned). */
export const cutoutFrame = (n: number) => staticFile(`cutout/frame_${String(n).padStart(4, '0')}.jpg`);

/** Props every effect gets from the plan. Times are seconds in the final video. */
export type Base = {start: number; end: number};

/** The base video, synced to where the effect sits on the timeline. */
export const Clip: React.FC<{from: number; style?: React.CSSProperties}> = ({from, style}) => (
  <OffthreadVideo src={VIDEO} trimBefore={from} muted
    style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style}} />
);

/** A still frame of the base video. */
export const Still: React.FC<{frame: number; style?: React.CSSProperties}> = ({frame, style}) => (
  <Freeze frame={Math.max(0, frame)}><Clip from={0} style={style} /></Freeze>
);

/** Spring from 0 to 1 starting at `at` seconds (local effect time). */
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

/** The theme's glass look (background, border, text color, corners and glow). */
export const glass = (radius = THEME.glass.radius): React.CSSProperties => ({
  color: THEME.glass.text, background: THEME.glass.background, backdropFilter: 'blur(28px) saturate(1.6)',
  border: `2px solid ${THEME.glass.border}`, borderRadius: radius,
  boxShadow: `0 26px 60px rgba(0,0,0,.28), inset 0 2px 0 rgba(255,255,255,.5)${THEME.glass.glow === 'none' ? '' : ', ' + THEME.glass.glow}`,
});

/** Glass card that springs in and floats. */
export const Glass: React.FC<{at: number; i?: number; style: React.CSSProperties; children: React.ReactNode}> = ({at, i = 0, style, children}) => {
  const f = useCurrentFrame();
  const p = spring({frame: f - F(at), fps: FPS, config: {damping: 13, stiffness: 160}});
  const bob = Math.sin((f / FPS) * 1.8 + i * 1.3) * 10;
  return (
    <div style={{position: 'absolute', padding: 30, ...glass(),
      opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 60 + bob}px) scale(${0.7 + 0.3 * p})`, ...style}}>
      {children}
    </div>
  );
};

export const Heart: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 4.2 2.6h2c.6-1.5 2.1-2.6 4.2-2.6 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
  </svg>
);

export const Check: React.FC<{size?: number}> = ({size = 32}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#0b2a14" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
