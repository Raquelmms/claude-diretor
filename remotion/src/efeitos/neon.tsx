import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, spring, interpolate} from 'remotion';
import {FONTES, TITULO, FPS, F, CL, COR, recorte, quadro, Base} from '../comum';

/* ------------------------------------------------------------------ */
/* neon / texto-atras: título atrás da cabeça da pessoa (pede recorte)  */
/* ------------------------------------------------------------------ */
export type NeonProps = Base & {
  texto: string;
  /** neon = tubo de luz que acende piscando; solido = letras gigantes; contorno = só o traço. */
  estilo?: 'neon' | 'solido' | 'contorno';
  /** Só para o neon: tubo (arredondada), script (letra cursiva) ou retro (linhas duplas). */
  fonte?: 'tubo' | 'script' | 'retro';
  cor?: string;
  /** Altura do meio do texto, em px de 1920. O padrão fica atrás da cabeça. */
  y?: number;
};

// Liga e desliga como um tubo de neon acendendo (1 = aceso).
const PISCA: [number, number][] = [[0, 0], [0.08, 1], [0.14, 0.1], [0.2, 1], [0.26, 0.2], [0.3, 0.2], [0.36, 1], [0.5, 0.35], [0.54, 1]];
const brilhoNeon = (t: number) => {
  let v = 0;
  for (const [at, val] of PISCA) if (t >= at) v = val;
  return t > 0.6 ? 0.93 + 0.07 * Math.sin(t * 37) * Math.sin(t * 13) : v;
};

export const Neon: React.FC<NeonProps> = ({inicio, texto, estilo = 'neon', fonte = 'tubo', cor, y = 560}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const n = F(inicio) + f;
  const len = Math.max(3, texto.length);
  const c = cor ?? COR.destaque;

  let camada: React.ReactNode;
  if (estilo === 'neon') {
    const b = brilhoNeon(t);
    const familia = fonte === 'script' ? FONTES.neonderthaw : fonte === 'retro' ? FONTES.monoton : FONTES.tiltNeon;
    const tam = Math.min(fonte === 'script' ? 330 : 270, (fonte === 'script' ? 2200 : 1750) / len);
    camada = (
      <>
        {/* reflexo da luz na parede */}
        <div style={{position: 'absolute', left: '50%', top: y, width: 1100, height: 700, transform: 'translate(-50%,-50%)',
          background: `radial-gradient(closest-side, ${c}, transparent)`, opacity: 0.35 * b, mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', left: 40, right: 40, top: y, transform: 'translateY(-50%)', textAlign: 'center',
          fontFamily: familia, fontSize: tam, lineHeight: 1, whiteSpace: 'nowrap',
          color: b > 0.5 ? '#fff' : c, opacity: 0.25 + 0.75 * b,
          textShadow: b > 0.5 ? `0 0 6px #fff, 0 0 16px ${c}, 0 0 40px ${c}, 0 0 80px ${c}, 0 0 140px ${c}` : 'none'}}>
          {texto}
        </div>
      </>
    );
  } else {
    const p = spring({frame: f, fps: FPS, config: {damping: 15, stiffness: 120}});
    // Uma palavra por linha, no tamanho da linha mais comprida.
    const linhas = texto.trim().split(/\s+/);
    const tam = Math.min(420, 1750 / Math.max(3, ...linhas.map(l => l.length)));
    camada = (
      <div style={{position: 'absolute', left: 0, right: 0, top: y - (linhas.length - 1) * tam * 0.45, textAlign: 'center', fontFamily: TITULO, fontSize: tam, lineHeight: 0.9,
        textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '-0.01em',
        transform: `translateY(${-50 + (1 - p) * 30}%) scale(${0.85 + 0.15 * p})`, opacity: interpolate(p, [0, 0.4], [0, 1], CL),
        color: estilo === 'contorno' ? 'transparent' : c, WebkitTextStroke: estilo === 'contorno' ? `7px ${c}` : undefined,
        textShadow: estilo === 'solido' ? '0 20px 60px rgba(0,0,0,.25)' : undefined}}>
        {linhas.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    );
  }
  return (
    <AbsoluteFill style={{isolation: 'isolate'}}>
      {/* O quadro original e o recorte saem do mesmo frame, então ficam alinhados. */}
      <Img src={quadro(n)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      {camada}
      <Img src={recorte(n)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};
