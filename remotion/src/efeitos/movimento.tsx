import React from 'react';
import {AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame, interpolate, spring, Easing} from 'remotion';
import {ANTON, HAND, UI, MONO, FPS, F, COR, CL, lerp, recorte, quadro, Base, Clip, Still, usePop, Pop} from '../comum';
import info from '../dados/info.json';

/* ------------------------------------------------------------------ */
/* orbita: telas girando em 3D em volta da pessoa (pede recorte)        */
/* ------------------------------------------------------------------ */
export type OrbitaProps = Base & {
  /** Imagens em remotion/public (ex.: "miniaturas/1.png"). Sem isso, usa quadros do próprio vídeo. */
  imagens?: string[];
};
const ALTURAS = [720, 860, 760, 900, 700, 880, 780, 840];
const TAMANHOS = [1.05, 0.9, 1.0, 0.95, 0.85, 1.1, 0.9, 1.0];
export const Orbita: React.FC<OrbitaProps> = ({inicio, imagens}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const cards = ALTURAS.map((y, i) => {
    const a = (i / ALTURAS.length) * Math.PI * 2 + t * 0.55 + 0.3;
    const sn = Math.sin(a), co = Math.cos(a);
    const depth = (sn + 1) / 2;
    const enter = spring({frame: f - i * 2, fps: FPS, config: {damping: 16, stiffness: 120}});
    const w = 235 * TAMANHOS[i];
    const img = imagens?.length ? imagens[i % imagens.length] : null;
    const quadro = Math.round(((i + 0.5) / ALTURAS.length) * (info.frames - 1));
    return {
      depth,
      el: (
        <div key={i} style={{position: 'absolute', left: 540 + co * 430, top: y + 70 + sn * 380 + Math.sin(t * 1.3 + i) * 18,
          width: w, height: (w * 16) / 9, zIndex: depth < 0.5 ? Math.round(depth * 100) : 51 + Math.round(depth * 100), opacity: Math.min(1, enter * 1.5),
          transform: `translate(-50%,-50%) perspective(1400px) rotateY(${-co * 32}deg) rotateZ(${-co * 5 + (i % 2 ? 2 : -2)}deg) scale(${(0.72 + 0.38 * depth) * (1 - 0.25 * depth * (1 - Math.abs(co))) * enter})`,
          filter: `blur(${(1 - depth) * 3}px) brightness(${0.7 + 0.3 * depth})`}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', border: '4px solid rgba(255,255,255,.9)',
            boxShadow: `0 ${20 + depth * 30}px ${40 + depth * 40}px rgba(0,0,0,${0.25 + depth * 0.25})`}}>
            {img ? <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              : <Still frame={quadro} style={{filter: `saturate(${1 + (i % 3) * 0.15}) hue-rotate(${(i % 3 - 1) * 8}deg)`}} />}
          </div>
        </div>
      ),
    };
  });
  const atras = cards.filter(c => c.depth < 0.5).sort((x, y) => x.depth - y.depth);
  const frente = cards.filter(c => c.depth >= 0.5).sort((x, y) => x.depth - y.depth);
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {/* O quadro original e o recorte saem do mesmo frame, então ficam alinhados (sem contorno fantasma). */}
      <Img src={quadro(F(inicio) + f)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      {atras.map(c => c.el)}
      <Img src={recorte(F(inicio) + f)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 50}} />
      {frente.map(c => c.el)}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* texto-video: o vídeo aparece só dentro de letras gigantes            */
/* ------------------------------------------------------------------ */
export type TextoVideoProps = Base & {linha1: string; linha2?: string; linha2Em?: number};
export const TextoVideo: React.FC<TextoVideoProps> = ({inicio, fim, linha1, linha2, linha2Em}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = fim - inicio, z0 = len - 0.42;
  const z = t < z0 ? 1 + t * 0.04 : interpolate(t, [z0, len - 0.02], [1 + z0 * 0.04, 30], {...CL, easing: Easing.in(Easing.cubic)});
  const p1 = usePop(0), p2 = usePop(linha2Em !== undefined ? linha2Em - inicio : 0.5);
  const maior = Math.max(linha1.length, (linha2 ?? '').length);
  const tam = Math.min(330, 2000 / Math.max(4, maior));
  const palavra = (p: number): React.CSSProperties => ({fontFamily: ANTON, fontSize: tam, lineHeight: 0.86, color: '#fff',
    textTransform: 'uppercase', opacity: Math.min(1, p * 2), transform: `scale(${0.6 + 0.4 * p})`});
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      <Clip from={F(inicio)} />
      <AbsoluteFill style={{background: '#000', mixBlendMode: 'multiply', opacity: t > len - 0.05 ? 0 : 1}}>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${z})`, transformOrigin: '50% 44%'}}>
          <div style={palavra(p1)}>{linha1}</div>
          {linha2 && <div style={palavra(p2)}>{linha2}</div>}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* freeze-ranking: flash, congela e vira foto com #1, #2 e #3           */
/* ------------------------------------------------------------------ */
export type FreezeRankingProps = Base & {titulo?: string; itens: [string, string, string]};
const Polaroid: React.FC<{k: number; label: string; rank: string; rankAt: number; children: React.ReactNode}> = ({k, label, rank, rankAt, children}) => {
  const p = usePop(rankAt);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#f4f2ee', borderRadius: lerp(0, 10, k),
      padding: `${18 * k}px ${18 * k}px ${76 * k}px`, boxShadow: `0 30px 80px rgba(0,0,0,${0.7 * k})`}}>
      <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 6}}>{children}</div>
      <div style={{position: 'absolute', left: 26, bottom: 18, fontFamily: UI, fontWeight: 800, fontSize: 34, color: '#222', opacity: k, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', top: -40, left: -30, fontFamily: ANTON, fontSize: 100, lineHeight: 1, color: '#fff', background: COR.vermelho,
        padding: '6px 24px', borderRadius: 20, opacity: Math.min(1, p * 2), transform: `rotate(-8deg) scale(${0.5 + 0.5 * p})`}}>{rank}</div>
    </div>
  );
};
export const FreezeRanking: React.FC<FreezeRankingProps> = ({inicio, titulo = 'TOP 3', itens}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const from = F(inicio);
  const flash = interpolate(t, [0, 0.25], [1, 0], CL);
  const k = spring({frame: f - 3, fps: FPS, config: {damping: 16}});
  const s2 = spring({frame: f - F(0.55), fps: FPS, config: {damping: 15}});
  const s3 = spring({frame: f - F(0.8), fps: FPS, config: {damping: 15}});
  const outro = (frac: number) => Math.round(frac * (info.frames - 1));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Freeze frame={0}><Clip from={from} style={{filter: 'blur(24px) brightness(.35) saturate(.6)', transform: 'scale(1.2)'}} /></Freeze>
      <Pop at={0.3} style={{left: 650, top: 300}}>
        <div style={{fontFamily: ANTON, fontSize: 92, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', maxWidth: 260}}>{titulo}</div>
      </Pop>
      <div style={{position: 'absolute', left: 120 + (1 - s3) * -700, top: 1000, width: 390, height: 490, transform: 'rotate(-3deg)'}}>
        <Polaroid k={1} label={itens[2]} rank="#3" rankAt={1.0}><Still frame={outro(0.7)} /></Polaroid>
      </div>
      <div style={{position: 'absolute', left: 475 + (1 - s2) * 800, top: 600, width: 410, height: 520, transform: 'rotate(5deg)'}}>
        <Polaroid k={1} label={itens[1]} rank="#2" rankAt={0.75}><Still frame={outro(0.3)} /></Polaroid>
      </div>
      <div style={{position: 'absolute', left: lerp(0, 76, k), top: lerp(0, 290, k), width: lerp(1080, 540, k), height: lerp(1920, 690, k),
        transform: `rotate(${-6 * k}deg)`}}>
        <Polaroid k={k} label={itens[0]} rank="#1" rankAt={0.45}>
          <Freeze frame={0}><Clip from={from} /></Freeze>
        </Polaroid>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* folha-contato: 9 versões, caneta circula uma e ela dá zoom           */
/* ------------------------------------------------------------------ */
export type FolhaContatoProps = Base & {texto?: string};
const CELULA = (i: number) => ({x: 54 + (i % 3) * 330, y: 230 + Math.floor(i / 3) * 408, w: 310, h: 388});
export const FolhaContato: React.FC<FolhaContatoProps> = ({inicio, fim, texto = 'essa!'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = fim - inicio;
  const from = F(inicio);
  const luz = t < 0.6 ? [0, 4, 8, 2, 6, 1, 5, 3, 7][Math.floor(t * 12) % 9] : -1;
  const risco = interpolate(t, [0.6, 0.88], [0, 1], CL);
  const k = interpolate(t, [len - 0.5, len - 0.1], [0, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const c = CELULA(4);
  return (
    <AbsoluteFill style={{background: '#15120f'}}>
      {Array.from({length: 9}, (_, i) => {
        const r = CELULA(i);
        return (
          <div key={i} style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, background: '#050403', padding: 10,
            boxShadow: luz === i ? '0 0 0 8px #fff' : 'none'}}>
            <Clip from={from} style={{filter: `hue-rotate(${((i % 3) - 1) * 12}deg) brightness(${0.85 + (i % 4) * 0.06})`}} />
            <span style={{position: 'absolute', left: 20, bottom: 16, fontFamily: MONO, fontSize: 26, color: '#ffb84d'}}>{14 + i}A ▸</span>
          </div>
        );
      })}
      <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <ellipse cx={c.x + c.w / 2} cy={c.y + c.h / 2} rx={205} ry={250} fill="none" stroke={COR.vermelho} strokeWidth={12} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - risco} transform={`rotate(-6 ${c.x + c.w / 2} ${c.y + c.h / 2})`} />
      </svg>
      <Pop at={0.88} rot={-10} style={{left: 650, top: 470}}>
        <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 150, color: COR.vermelho}}>{texto}</div>
      </Pop>
      {k > 0 && (
        <div style={{position: 'absolute', overflow: 'hidden', left: lerp(c.x + 10, 0, k), top: lerp(c.y + 10, 0, k),
          width: lerp(c.w - 20, 1080, k), height: lerp(c.h - 20, 1920, k)}}>
          <Clip from={from} />
        </div>
      )}
    </AbsoluteFill>
  );
};
