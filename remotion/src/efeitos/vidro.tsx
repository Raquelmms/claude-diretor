import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';
import {ANTON, UI, MONO, FPS, F, COR, CL, Base, Still, usePop, Glass, Coracao, Check} from '../comum';

/* ------------------------------------------------------------------ */
/* widgets: vários widgets de vidro estilo iPhone em volta da pessoa    */
/* ------------------------------------------------------------------ */
export type WidgetsProps = Base & {
  /** Até 4 momentos (segundos) em que os grupos de widgets entram. */
  em?: number[];
  numero?: {rotulo: string; valor: number; legenda: string};
  grafico?: {rotulo: string; valor: string};
  contador?: {valor: string; botao: string};
  perfil?: {nome: string; legenda: string};
  musica?: {rotulo: string; titulo: string};
  progresso?: string;
  anel?: string;
  selo?: string;
};
export const Widgets: React.FC<WidgetsProps> = ({inicio, fim, em, numero = {rotulo: 'Claude', valor: 9, legenda: 'efeitos · 1 clipe'},
  grafico = {rotulo: 'Top reels', valor: '12,4K'}, contador = {valor: '21', botao: 'Postar 2 reels'},
  perfil = {nome: 'Você', legenda: 'editado com IA'}, musica = {rotulo: 'Tocando', titulo: 'pops suaves'},
  progresso = 'Renderizando', anel = '4K', selo = 'Editado pelo Claude'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = fim - inicio;
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map(i => (em?.[i] !== undefined ? em[i] - inicio : 0.1 + i * 0.35));
  const ring = interpolate(t, [a3, a3 + 0.8], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
  const prog = interpolate(t, [a0, len], [0.2, 0.96], CL);
  const lbl: React.CSSProperties = {fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: '0.1em', opacity: 0.75, textTransform: 'uppercase'};
  const pad = {padding: 24, borderRadius: 34};
  return (
    <AbsoluteFill>
      <Glass at={a0} i={0} style={{left: 40, top: 250, width: 300, ...pad}}>
        <div style={lbl}>{numero.rotulo}</div>
        <div style={{fontFamily: ANTON, fontSize: 120, lineHeight: 1}}>{Math.round(interpolate(t, [a0, a0 + 0.5], [0, numero.valor], CL))}</div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 26, opacity: 0.85}}>{numero.legenda}</div>
      </Glass>
      <Glass at={a1} i={1} style={{left: 40, top: 505, width: 300, ...pad}}>
        <div style={lbl}>{grafico.rotulo}</div>
        <div style={{fontFamily: ANTON, fontSize: 56, lineHeight: 1.1, color: COR.destaque}}>{grafico.valor}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, marginTop: 6}}>
          {[1, 0.72, 0.6, 0.45, 0.33, 0.25].map((h, i) => (
            <div key={i} style={{flex: 1, borderRadius: 4, background: i ? COR.destaque : COR.amarelo,
              height: `${h * 100 * spring({frame: f - F(a1) - i * 2, fps: FPS, config: {damping: 14}})}%`}} />
          ))}
        </div>
      </Glass>
      <Glass at={a2} i={2} style={{left: 40, top: 790, width: 300, ...pad}}>
        <div style={{fontFamily: ANTON, fontSize: 84, lineHeight: 1}}>{contador.valor}</div>
        <div style={{display: 'inline-block', marginTop: 8, fontFamily: UI, fontWeight: 800, fontSize: 24, background: COR.vermelho, padding: '6px 14px', borderRadius: 12}}>{contador.botao}</div>
      </Glass>
      <Glass at={a0} i={3} style={{left: 740, top: 250, width: 300, ...pad}}>
        <div style={{...lbl, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: '#ff4d4d', opacity: Math.floor(t * 3) % 2 ? 0.3 : 1}} />{progresso}
        </div>
        <div style={{height: 14, borderRadius: 8, background: 'rgba(255,255,255,.25)', marginTop: 14, overflow: 'hidden'}}>
          <div style={{width: `${prog * 100}%`, height: '100%', background: '#fff', borderRadius: 8}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 22, marginTop: 10, opacity: 0.8}}>{anel} · {Math.round(prog * 100)}%</div>
      </Glass>
      <Glass at={a1} i={4} style={{left: 740, top: 445, width: 300, ...pad, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flex: 'none', border: '3px solid #fff'}}>
          <Still frame={F(inicio)} style={{objectPosition: '50% 38%', transform: 'scale(2.6)'}} />
        </div>
        <div>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30}}>{perfil.nome}</div>
          <div style={{fontFamily: UI, fontWeight: 600, fontSize: 22, opacity: 0.8}}>{perfil.legenda}</div>
        </div>
      </Glass>
      <Glass at={a2} i={5} style={{left: 740, top: 600, width: 300, ...pad}}>
        <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
          <div style={{width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg, ${COR.destaque}, ${COR.amarelo})`, flex: 'none'}} />
          <div><div style={lbl}>{musica.rotulo}</div><div style={{fontFamily: UI, fontWeight: 800, fontSize: 26}}>{musica.titulo}</div></div>
        </div>
        <svg width={252} height={40} viewBox="0 0 252 40" style={{marginTop: 12}}>
          <path d="M70 8v24M96 8l-22 12 22 12z" fill="#fff" stroke="#fff" strokeWidth={3} />
          <path d="M116 6l26 14-26 14z" fill="#fff" />
          <path d="M182 8v24M156 8l22 12-22 12z" fill="#fff" stroke="#fff" strokeWidth={3} />
        </svg>
      </Glass>
      <Glass at={a3} i={6} style={{left: 740, top: 790, width: 300, ...pad, display: 'flex', alignItems: 'center', gap: 18}}>
        <svg width={110} height={110} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={4.5} />
          <circle cx={20} cy={20} r={16} fill="none" stroke={COR.verde} strokeWidth={4.5} strokeLinecap="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 20 20)" />
          <text x={20} y={24} textAnchor="middle" fill="#fff" style={{fontFamily: ANTON, fontSize: 11}}>{anel}</text>
        </svg>
        <div style={lbl}>render</div>
      </Glass>
      <Glass at={a3} i={7} style={{left: 0, right: 0, margin: '0 auto', width: 'fit-content', top: 1250, padding: '20px 40px', borderRadius: 60}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap'}}>{selo}</div>
      </Glass>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* likes: contador de curtidas, corações subindo e comentários de vidro */
/* ------------------------------------------------------------------ */
export type LikesProps = Base & {numero?: number; sufixo?: string; comentarios?: {usuario: string; texto: string}[]};
export const Likes: React.FC<LikesProps> = ({numero = 12.4, sufixo = 'mil',
  comentarios = [{usuario: '@alguem', texto: 'como você fez isso??'}, {usuario: '@outra.pessoa', texto: 'preciso disso urgente'}]}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const n = interpolate(t, [0.1, 1.1], [0, numero], {...CL, easing: Easing.out(Easing.cubic)});
  const casas = Number.isInteger(numero) ? 0 : 1;
  return (
    <AbsoluteFill>
      {Array.from({length: 12}, (_, i) => {
        const k = (t - i * 0.09) / 1.1;
        if (k < 0 || k > 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 700 + Math.sin(i * 2.1 + t * 4) * 70 + (i % 3) * 40, top: 1250 - k * 900,
            opacity: k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4), transform: `scale(${0.6 + (i % 4) * 0.2}) rotate(${(i % 5 - 2) * 8}deg)`}}>
            <Coracao size={90} color={i % 3 ? COR.vermelho : '#ff7a9a'} />
          </div>
        );
      })}
      <Glass at={0} style={{left: 60, top: 250, display: 'flex', alignItems: 'center', gap: 22}}>
        <Coracao size={84} color={COR.vermelho} />
        <div style={{fontFamily: ANTON, fontSize: 104, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n.toFixed(casas).replace('.', ',')} {sufixo}</div>
      </Glass>
      {comentarios.slice(0, 2).map((c, i) => (
        <Glass key={i} at={0.35 + i * 0.35} i={i + 1} style={{left: 60, top: 1080 + i * 190, width: 620}}>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30, opacity: 0.8}}>{c.usuario}</div>
          <div style={{fontFamily: UI, fontWeight: 600, fontSize: 38}}>{c.texto}</div>
        </Glass>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* checklist: card de vidro marcando cada item quando a pessoa fala     */
/* ------------------------------------------------------------------ */
export type ChecklistProps = Base & {
  titulo?: string; tituloPronto?: string;
  itens: {texto: string; tag?: string; em: number}[];
  prontoEm?: number; fechamento?: string;
};
export const Checklist: React.FC<ChecklistProps> = ({inicio, fim, titulo = 'Claude está editando…', tituloPronto = 'Claude editou seu vídeo',
  itens, prontoEm, fechamento = 'PRONTO PRA POSTAR'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fimLocal = (prontoEm ?? Math.min(fim - 0.6, itens[itens.length - 1].em + 0.8)) - inicio;
  const done = t >= fimLocal;
  const ok = usePop(fimLocal);
  const feitos = itens.filter(it => t >= it.em - inicio).length;
  return (
    <AbsoluteFill>
      <Glass at={0} style={{left: 60, width: 860, top: 1060}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: UI, fontWeight: 800, fontSize: 36}}>
          <div style={{width: 34, height: 34, borderRadius: '50%', border: `6px solid ${done ? COR.verde : 'rgba(255,255,255,.3)'}`,
            borderTopColor: done ? COR.verde : COR.destaque, transform: `rotate(${done ? 0 : f * 16}deg)`}} />
          <span style={{flex: 1}}>{done ? tituloPronto : titulo}</span>
          <span style={{fontFamily: MONO, fontSize: 26, opacity: 0.7}}>{feitos} de {itens.length}</span>
        </div>
        {itens.map((it, i) => {
          const c = spring({frame: f - F(it.em - inicio), fps: FPS, config: {damping: 12, stiffness: 200}});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 24, fontFamily: UI, fontWeight: 600, fontSize: 40, opacity: 0.5 + 0.5 * Math.min(1, c)}}>
              <div style={{width: 52, height: 52, borderRadius: 16, flex: 'none', border: '3px solid rgba(255,255,255,.5)', background: c > 0.05 ? COR.verde : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * Math.min(1.2, c)})`}}>
                {c > 0.05 && <Check />}
              </div>
              <span style={{flex: 1}}>{it.texto}</span>
              {it.tag && <span style={{fontFamily: MONO, fontSize: 26, color: COR.verde, opacity: c > 0.05 ? 1 : 0}}>{it.tag}</span>}
            </div>
          );
        })}
      </Glass>
      {fechamento && (
        <div style={{position: 'absolute', left: 60, top: 1060 + 120 + itens.length * 76 + 70, opacity: Math.min(1, ok * 2), transform: `scale(${0.6 + 0.4 * ok})`,
          transformOrigin: 'left center', fontFamily: ANTON, fontSize: 64, lineHeight: 1, background: COR.amarelo, color: '#111', padding: '14px 28px', borderRadius: 20}}>
          {fechamento}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* grafico: comparação antes x depois em card de vidro                  */
/* ------------------------------------------------------------------ */
export type GraficoProps = Base & {
  titulo?: string;
  antes: {rotulo: string; valor: string; em: number};
  depois: {rotulo: string; valor: string; em: number; proporcao: number};
};
export const Grafico: React.FC<GraficoProps> = ({inicio, titulo = 'Comparação', antes, depois}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const card = usePop(0, 14);
  const g0 = antes.em - inicio, g1 = depois.em - inicio;
  const b1 = interpolate(t, [g0, g0 + 0.5], [0, 100], {...CL, easing: Easing.out(Easing.cubic)});
  const b2 = interpolate(t, [g1, g1 + 0.3], [0, Math.max(2, depois.proporcao * 100)], {...CL, easing: Easing.out(Easing.cubic)});
  const linha = (rotulo: string, valor: string, w: number, cor: string, mostrar: boolean) => (
    <div style={{marginTop: 26}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 800, fontSize: 38, opacity: mostrar ? 1 : 0.35}}>
        <span>{rotulo}</span><span style={{color: cor}}>{mostrar ? valor : ''}</span>
      </div>
      <div style={{height: 34, borderRadius: 20, background: '#ffffff30', marginTop: 10, overflow: 'hidden'}}>
        <div style={{width: `${w}%`, height: '100%', borderRadius: 20, background: cor}} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 66, top: 1080, width: 760, padding: 40, borderRadius: 50, color: '#fff',
        background: 'rgba(28,26,34,.42)', backdropFilter: 'blur(26px) saturate(1.5)', border: '2px solid rgba(255,255,255,.35)',
        boxShadow: '0 30px 70px #0006, inset 0 2px 0 #ffffff66', opacity: Math.min(1, card * 2), transform: `scale(${0.7 + 0.3 * card})`}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '0.14em', opacity: 0.85, textTransform: 'uppercase'}}>{titulo}</div>
        {linha(antes.rotulo, antes.valor, b1, '#ffffffdd', t >= g0)}
        {linha(depois.rotulo, depois.valor, b2, COR.amarelo, t >= g1)}
      </div>
    </AbsoluteFill>
  );
};
