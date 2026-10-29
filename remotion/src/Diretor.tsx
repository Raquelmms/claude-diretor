import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, useCurrentFrame} from 'remotion';
import {ANTON, FPS, F, COR, VIDEO} from './comum';
import {Orbita, TextoVideo, FreezeRanking, FolhaContato} from './efeitos/movimento';
import {Widgets, Likes, Checklist, Grafico} from './efeitos/vidro';
import {SplitClaude, Cta} from './efeitos/tela';
import plano from './dados/plano.json';
import palavras from './dados/palavras.json';
import info from './dados/info.json';

/** Nome do efeito no plano.json → componente. */
const EFEITOS: Record<string, React.FC<any>> = {
  'orbita': Orbita,
  'texto-video': TextoVideo,
  'widgets': Widgets,
  'freeze-ranking': FreezeRanking,
  'likes': Likes,
  'folha-contato': FolhaContato,
  'split-claude': SplitClaude,
  'checklist': Checklist,
  'grafico': Grafico,
  'cta': Cta,
};
/** Efeitos que deixam a legenda aparecer (no topo, pra não cobrir o rosto). */
const COM_LEGENDA = new Set(['split-claude']);

type Efeito = {tipo: string; inicio: number; fim: number; [k: string]: unknown};
type Palavra = {w: string; s: number; e: number};
const efeitos = (plano.efeitos as Efeito[]).filter(e => {
  if (!EFEITOS[e.tipo]) console.warn(`Efeito desconhecido no plano: ${e.tipo}`);
  return EFEITOS[e.tipo];
});
// A órbita fica por baixo dos outros efeitos (ex.: a chamada final por cima dela).
const ordenados = [...efeitos].sort((a, b) => Number(b.tipo === 'orbita') - Number(a.tipo === 'orbita'));

/* Legenda palavra por palavra: grupos de até 3 palavras, quebrando na pontuação. */
const GRUPOS: Palavra[][] = [];
(palavras as Palavra[]).forEach((w, i, arr) => {
  const prev = arr[i - 1];
  if (!GRUPOS.length || GRUPOS[GRUPOS.length - 1].length >= 3 || (prev && /[.,!?]$/.test(prev.w))) GRUPOS.push([]);
  GRUPOS[GRUPOS.length - 1].push(w);
});
const Legenda: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ativo = efeitos.find(e => t >= e.inicio && t < e.fim);
  if (ativo && !COM_LEGENDA.has(ativo.tipo)) return null;
  const gi = GRUPOS.findIndex((g, i) => t >= g[0].s - 0.05 && (i === GRUPOS.length - 1 || t < GRUPOS[i + 1][0].s - 0.05));
  if (gi < 0) return null;
  const g = GRUPOS[gi];
  if (t > g[g.length - 1].e + 0.6) return null;
  return (
    <div style={{position: 'absolute', left: 80, width: 838, top: ativo ? 620 : 1290, textAlign: 'center', fontFamily: ANTON, fontSize: 92,
      lineHeight: 1.08, textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill'}}>
      {g.map((w, i) => {
        const atual = t >= w.s && (i === g.length - 1 || t < g[i + 1].s);
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', color: atual ? COR.amarelo : '#fff', transform: `scale(${atual ? 1.1 : 1})`}}>
            {w.w.replace(/[.,!?]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

export const Diretor: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={VIDEO} />
    {ordenados.map((e, i) => {
      const C = EFEITOS[e.tipo];
      const de = F(e.inicio), ate = Math.min(info.frames, F(e.fim));
      if (ate <= de) return null;
      return <Sequence key={i} from={de} durationInFrames={ate - de} name={e.tipo}><C {...e} /></Sequence>;
    })}
    {plano.legenda !== false && <Legenda />}
  </AbsoluteFill>
);
