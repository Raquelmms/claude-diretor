import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONTES, TITULO, FPS, F, COR, VIDEO, ESTILO_LEGENDA} from './comum';
import {Orbita, TextoVideo, FreezeRanking, FolhaContato} from './efeitos/movimento';
import {Widgets, Likes, Checklist, Grafico} from './efeitos/vidro';
import {SplitClaude, Cta} from './efeitos/tela';
import {Neon} from './efeitos/neon';
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
  'neon': Neon,
  'texto-atras': (p: any) => <Neon estilo="solido" {...p} />,
};
/** Efeitos que deixam a legenda aparecer. */
const COM_LEGENDA = new Set(['split-claude', 'neon', 'texto-atras']);

type Efeito = {tipo: string; inicio: number; fim: number; [k: string]: any};
type Palavra = {w: string; s: number; e: number};
const P = plano as {efeitos: Efeito[]; legenda?: boolean; sons?: boolean};
const efeitos = P.efeitos.filter(e => {
  if (!EFEITOS[e.tipo]) console.warn(`Efeito desconhecido no plano: ${e.tipo}`);
  return EFEITOS[e.tipo];
});
// A órbita fica por baixo dos outros efeitos (ex.: a chamada final por cima dela).
const ordenados = [...efeitos].sort((a, b) => Number(b.tipo === 'orbita') - Number(a.tipo === 'orbita'));

/* ------------------------------------------------------------------ */
/* Legenda palavra por palavra, em 5 estilos                            */
/* ------------------------------------------------------------------ */
const GRUPOS: Palavra[][] = [];
(palavras as Palavra[]).forEach((w, i, arr) => {
  const prev = arr[i - 1];
  if (!GRUPOS.length || GRUPOS[GRUPOS.length - 1].length >= 3 || (prev && /[.,!?]$/.test(prev.w))) GRUPOS.push([]);
  GRUPOS[GRUPOS.length - 1].push(w);
});

const ESTILOS: Record<string, {caixa: React.CSSProperties; palavra: (atual: boolean) => React.CSSProperties}> = {
  forte: {
    caixa: {fontFamily: TITULO, fontSize: 92, lineHeight: 1.08, textTransform: 'uppercase', color: '#fff', WebkitTextStroke: '16px #000', paintOrder: 'stroke fill'},
    palavra: a => ({color: a ? COR.amarelo : '#fff', transform: `scale(${a ? 1.1 : 1})`}),
  },
  neon: {
    caixa: {fontFamily: FONTES.tiltNeon, fontSize: 88, lineHeight: 1.1, textTransform: 'uppercase', color: '#fff'},
    palavra: a => ({color: '#fff', textShadow: `0 0 6px #fff, 0 0 18px ${a ? COR.amarelo : COR.destaque}, 0 0 42px ${a ? COR.amarelo : COR.destaque}`,
      transform: `scale(${a ? 1.08 : 1})`}),
  },
  editorial: {
    caixa: {fontFamily: FONTES.playfair, fontStyle: 'italic', fontWeight: 800, fontSize: 84, lineHeight: 1.1, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,.55)'},
    palavra: a => ({color: '#fff', backgroundImage: a ? `linear-gradient(transparent 62%, ${COR.destaque} 62%, ${COR.destaque} 90%, transparent 90%)` : 'none'}),
  },
  manuscrito: {
    caixa: {fontFamily: FONTES.marker, fontSize: 88, lineHeight: 1.1, color: '#fff', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'},
    palavra: a => ({color: a ? COR.amarelo : '#fff', transform: `rotate(${a ? -4 : 0}deg) scale(${a ? 1.12 : 1})`}),
  },
  minimo: {
    caixa: {fontFamily: FONTES.manrope, fontWeight: 800, fontSize: 58, lineHeight: 1.3, color: '#fff'},
    palavra: a => ({color: '#fff', opacity: a ? 1 : 0.7, background: a ? 'rgba(0,0,0,.55)' : 'transparent', borderRadius: 14, padding: '0 10px'}),
  },
};

const Legenda: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ativo = efeitos.find(e => t >= e.inicio && t < e.fim);
  if (ativo && !COM_LEGENDA.has(ativo.tipo)) return null;
  const gi = GRUPOS.findIndex((g, i) => t >= g[0].s - 0.05 && (i === GRUPOS.length - 1 || t < GRUPOS[i + 1][0].s - 0.05));
  if (gi < 0) return null;
  const g = GRUPOS[gi];
  if (t > g[g.length - 1].e + 0.6) return null;
  const est = ESTILOS[ESTILO_LEGENDA] ?? ESTILOS.forte;
  return (
    <div style={{position: 'absolute', left: 80, width: 838, top: ativo?.tipo === 'split-claude' ? 620 : 1290, textAlign: 'center', ...est.caixa}}>
      {g.map((w, i) => {
        const atual = t >= w.s && (i === g.length - 1 || t < g[i + 1].s);
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 10px', ...est.palavra(atual)}}>
            {w.w.replace(/[.,!?]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Efeitos sonoros: cada efeito pede os sons dele, nos tempos dele      */
/* ------------------------------------------------------------------ */
type Som = {t: number; som: string; vol: number};
const sonsDe = (e: Efeito): Som[] => {
  const s = (t: number, som: string, vol = 0.35): Som => ({t, som, vol});
  const i = e.inicio;
  switch (e.tipo) {
    case 'orbita': return [s(i, 'whoosh', 0.3)];
    case 'texto-video': return [s(i, 'pop'), s(e.fim - 0.45, 'whoosh', 0.3)];
    case 'widgets': return (e.em ?? [i + 0.1, i + 0.45, i + 0.8, i + 1.15]).map((t: number) => s(t, 'pop', 0.3));
    case 'freeze-ranking': return [s(i, 'clique', 0.45), s(i + 0.45, 'pop'), s(i + 0.75, 'pop', 0.3), s(i + 1.0, 'pop', 0.3)];
    case 'likes': return [s(i, 'pop'), s(i + 0.35, 'pop', 0.3), s(i + 0.7, 'pop', 0.3)];
    case 'folha-contato': return [s(i + 0.88, 'pop'), s(e.fim - 0.5, 'whoosh', 0.3)];
    case 'split-claude': {
      const len = e.fim - i, dig = e.digitaEm ?? i + len * 0.35, env = e.enviaEm ?? i + len * 0.7;
      const n = Math.max(1, Math.round((Math.min(dig + 0.97, env - 0.15) - dig) / 0.09));
      return [s(i, 'whoosh', 0.3), ...Array.from({length: n}, (_, k) => s(dig + k * 0.09, 'tecla', 0.18)),
        s(env, 'pop', 0.3), s(e.prontoEm ?? i + len * 0.85, 'ding', 0.3)];
    }
    case 'checklist': return [s(i, 'whoosh', 0.25), ...(e.itens ?? []).map((it: any) => s(it.em, 'ding', 0.28)),
      ...(e.prontoEm ? [s(e.prontoEm, 'pop')] : [])];
    case 'grafico': return [s(i, 'pop'), s(e.antes?.em ?? i + 0.5, 'whoosh', 0.25), s(e.depois?.em ?? i + 2, 'pop')];
    case 'cta': return (e.linhas ?? []).map((l: any, k: number) => s(l.em ?? i + k * 0.3, 'pop', 0.38));
    case 'neon': return e.estilo && e.estilo !== 'neon' ? [s(i, 'whoosh', 0.3)] : [s(i, 'neon', 0.3)];
    case 'texto-atras': return [s(i, 'whoosh', 0.3)];
    default: return [];
  }
};
const SONS: Som[] = P.sons === false ? [] : efeitos.flatMap(sonsDe).filter(x => x.t >= 0 && F(x.t) < info.frames);

export const Diretor: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={VIDEO} />
    {ordenados.map((e, i) => {
      const C = EFEITOS[e.tipo];
      const de = F(e.inicio), ate = Math.min(info.frames, F(e.fim));
      if (ate <= de) return null;
      return <Sequence key={i} from={de} durationInFrames={ate - de} name={e.tipo}><C {...e} /></Sequence>;
    })}
    {P.legenda !== false && <Legenda />}
    {SONS.map((x, i) => (
      <Sequence key={`som${i}`} from={F(x.t)} durationInFrames={Math.min(40, info.frames - F(x.t))} name={`som ${x.som}`} layout="none">
        <Audio src={staticFile(`sons/${x.som}.wav`)} volume={x.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
