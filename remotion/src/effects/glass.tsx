import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, Easing} from 'remotion';
import {TITLE, UI, MONO, FPS, F, COLOR, CLAMP, Base, Still, usePop, Glass, Heart, Check, glass, THEME} from '../common';

/* ------------------------------------------------------------------ */
/* widgets: iPhone-style glass widgets floating around the person       */
/* ------------------------------------------------------------------ */
export type WidgetsProps = Base & {
  /** Up to 4 moments (seconds) when each group of widgets comes in. */
  at?: number[];
  number?: {label: string; value: number; caption: string};
  chart?: {label: string; value: string};
  counter?: {value: string; button: string};
  profile?: {name: string; caption: string};
  music?: {label: string; title: string};
  progress?: string;
  ring?: string;
  badge?: string;
};
export const Widgets: React.FC<WidgetsProps> = ({start, end, at, number = {label: 'Claude', value: 9, caption: 'effects · 1 clip'},
  chart = {label: 'Top reels', value: '12.4K'}, counter = {value: '21', button: 'Post 2 reels'},
  profile = {name: 'You', caption: 'edited with AI'}, music = {label: 'Playing', title: 'soft pops'},
  progress = 'Rendering', ring = '4K', badge = 'Edited by Claude'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const len = end - start;
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map(i => (at?.[i] !== undefined ? at[i] - start : 0.1 + i * 0.35));
  const ringProgress = interpolate(t, [a3, a3 + 0.8], [0, 1], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const prog = interpolate(t, [a0, len], [0.2, 0.96], CLAMP);
  const label: React.CSSProperties = {fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: '0.1em', opacity: 0.75, textTransform: 'uppercase'};
  const pad = {padding: 24, borderRadius: 34};
  return (
    <AbsoluteFill>
      <Glass at={a0} i={0} style={{left: 40, top: 250, width: 300, ...pad}}>
        <div style={label}>{number.label}</div>
        <div style={{fontFamily: TITLE, fontSize: 120, lineHeight: 1}}>{Math.round(interpolate(t, [a0, a0 + 0.5], [0, number.value], CLAMP))}</div>
        <div style={{fontFamily: UI, fontWeight: 600, fontSize: 26, opacity: 0.85}}>{number.caption}</div>
      </Glass>
      <Glass at={a1} i={1} style={{left: 40, top: 505, width: 300, ...pad}}>
        <div style={label}>{chart.label}</div>
        <div style={{fontFamily: TITLE, fontSize: 56, lineHeight: 1.1, color: COLOR.accent}}>{chart.value}</div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, marginTop: 6}}>
          {[1, 0.72, 0.6, 0.45, 0.33, 0.25].map((h, i) => (
            <div key={i} style={{flex: 1, borderRadius: 4, background: i ? COLOR.accent : COLOR.yellow,
              height: `${h * 100 * spring({frame: f - F(a1) - i * 2, fps: FPS, config: {damping: 14}})}%`}} />
          ))}
        </div>
      </Glass>
      <Glass at={a2} i={2} style={{left: 40, top: 790, width: 300, ...pad}}>
        <div style={{fontFamily: TITLE, fontSize: 84, lineHeight: 1}}>{counter.value}</div>
        <div style={{display: 'inline-block', marginTop: 8, fontFamily: UI, fontWeight: 800, fontSize: 24, background: COLOR.red, padding: '6px 14px', borderRadius: 12}}>{counter.button}</div>
      </Glass>
      <Glass at={a0} i={3} style={{left: 740, top: 250, width: 300, ...pad}}>
        <div style={{...label, display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: '#ff4d4d', opacity: Math.floor(t * 3) % 2 ? 0.3 : 1}} />{progress}
        </div>
        <div style={{height: 14, borderRadius: 8, background: 'rgba(255,255,255,.25)', marginTop: 14, overflow: 'hidden'}}>
          <div style={{width: `${prog * 100}%`, height: '100%', background: '#fff', borderRadius: 8}} />
        </div>
        <div style={{fontFamily: MONO, fontSize: 22, marginTop: 10, opacity: 0.8}}>{ring} · {Math.round(prog * 100)}%</div>
      </Glass>
      <Glass at={a1} i={4} style={{left: 740, top: 445, width: 300, ...pad, display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flex: 'none', border: '3px solid #fff'}}>
          <Still frame={F(start)} style={{objectPosition: '50% 38%', transform: 'scale(2.6)'}} />
        </div>
        <div>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30}}>{profile.name}</div>
          <div style={{fontFamily: UI, fontWeight: 600, fontSize: 22, opacity: 0.8}}>{profile.caption}</div>
        </div>
      </Glass>
      <Glass at={a2} i={5} style={{left: 740, top: 600, width: 300, ...pad}}>
        <div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
          <div style={{width: 64, height: 64, borderRadius: 14, background: `linear-gradient(135deg, ${COLOR.accent}, ${COLOR.yellow})`, flex: 'none'}} />
          <div><div style={label}>{music.label}</div><div style={{fontFamily: UI, fontWeight: 800, fontSize: 26}}>{music.title}</div></div>
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
          <circle cx={20} cy={20} r={16} fill="none" stroke={COLOR.green} strokeWidth={4.5} strokeLinecap="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={1 - ringProgress} transform="rotate(-90 20 20)" />
          <text x={20} y={24} textAnchor="middle" fill="#fff" style={{fontFamily: TITLE, fontSize: 11}}>{ring}</text>
        </svg>
        <div style={label}>render</div>
      </Glass>
      <Glass at={a3} i={7} style={{left: 0, right: 0, margin: '0 auto', width: 'fit-content', top: 1250, padding: '20px 40px', borderRadius: 60}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap'}}>{badge}</div>
      </Glass>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* likes: like counter, floating hearts and glass comments              */
/* ------------------------------------------------------------------ */
export type LikesProps = Base & {count?: number; suffix?: string; comments?: {user: string; text: string}[]};
export const Likes: React.FC<LikesProps> = ({count = 12.4, suffix = 'K',
  comments = [{user: '@someone', text: 'how did you do this??'}, {user: '@another.one', text: 'I need this asap'}]}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const n = interpolate(t, [0.1, 1.1], [0, count], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const decimals = Number.isInteger(count) ? 0 : 1;
  return (
    <AbsoluteFill>
      {Array.from({length: 12}, (_, i) => {
        const k = (t - i * 0.09) / 1.1;
        if (k < 0 || k > 1) return null;
        return (
          <div key={i} style={{position: 'absolute', left: 700 + Math.sin(i * 2.1 + t * 4) * 70 + (i % 3) * 40, top: 1250 - k * 900,
            opacity: k < 0.15 ? k / 0.15 : 1 - Math.max(0, (k - 0.6) / 0.4), transform: `scale(${0.6 + (i % 4) * 0.2}) rotate(${(i % 5 - 2) * 8}deg)`}}>
            <Heart size={90} color={i % 3 ? COLOR.red : '#ff7a9a'} />
          </div>
        );
      })}
      <Glass at={0} style={{left: 60, top: 250, display: 'flex', alignItems: 'center', gap: 22}}>
        <Heart size={84} color={COLOR.red} />
        <div style={{fontFamily: TITLE, fontSize: 104, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n.toFixed(decimals)}{suffix}</div>
      </Glass>
      {comments.slice(0, 2).map((c, i) => (
        <Glass key={i} at={0.35 + i * 0.35} i={i + 1} style={{left: 60, top: 1080 + i * 190, width: 620}}>
          <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30, opacity: 0.8}}>{c.user}</div>
          <div style={{fontFamily: UI, fontWeight: 600, fontSize: 38}}>{c.text}</div>
        </Glass>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* checklist: glass card ticking each item as the person says it        */
/* ------------------------------------------------------------------ */
export type ChecklistProps = Base & {
  title?: string; doneTitle?: string;
  items: {text: string; tag?: string; at: number}[];
  doneAt?: number; closing?: string;
};
export const Checklist: React.FC<ChecklistProps> = ({start, end, title = 'Claude is editing…', doneTitle = 'Claude edited your video',
  items, doneAt, closing = 'READY TO POST'}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const doneLocal = (doneAt ?? Math.min(end - 0.6, items[items.length - 1].at + 0.8)) - start;
  const done = t >= doneLocal;
  const ok = usePop(doneLocal);
  const ticked = items.filter(it => t >= it.at - start).length;
  return (
    <AbsoluteFill>
      <Glass at={0} style={{left: 60, width: 860, top: 1060}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, fontFamily: UI, fontWeight: 800, fontSize: 36}}>
          <div style={{width: 34, height: 34, borderRadius: '50%', border: `6px solid ${done ? COLOR.green : 'rgba(255,255,255,.3)'}`,
            borderTopColor: done ? COLOR.green : COLOR.accent, transform: `rotate(${done ? 0 : f * 16}deg)`}} />
          <span style={{flex: 1}}>{done ? doneTitle : title}</span>
          <span style={{fontFamily: MONO, fontSize: 26, opacity: 0.7}}>{ticked}/{items.length}</span>
        </div>
        {items.map((it, i) => {
          const c = spring({frame: f - F(it.at - start), fps: FPS, config: {damping: 12, stiffness: 200}});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 24, fontFamily: UI, fontWeight: 600, fontSize: 40, opacity: 0.5 + 0.5 * Math.min(1, c)}}>
              <div style={{width: 52, height: 52, borderRadius: 16, flex: 'none', border: '3px solid rgba(255,255,255,.5)', background: c > 0.05 ? COLOR.green : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * Math.min(1.2, c)})`}}>
                {c > 0.05 && <Check />}
              </div>
              <span style={{flex: 1}}>{it.text}</span>
              {it.tag && <span style={{fontFamily: MONO, fontSize: 26, color: COLOR.green, opacity: c > 0.05 ? 1 : 0}}>{it.tag}</span>}
            </div>
          );
        })}
      </Glass>
      {closing && (
        <div style={{position: 'absolute', left: 60, top: 1060 + 120 + items.length * 76 + 70, opacity: Math.min(1, ok * 2), transform: `scale(${0.6 + 0.4 * ok})`,
          transformOrigin: 'left center', fontFamily: TITLE, fontSize: 64, lineHeight: 1, background: COLOR.yellow, color: '#111', padding: '14px 28px', borderRadius: 20}}>
          {closing}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* chart: before vs after comparison on a glass card                    */
/* ------------------------------------------------------------------ */
export type ChartProps = Base & {
  title?: string;
  before: {label: string; value: string; at: number};
  after: {label: string; value: string; at: number; ratio: number};
};
export const Chart: React.FC<ChartProps> = ({start, title = 'Comparison', before, after}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const card = usePop(0, 14);
  const g0 = before.at - start, g1 = after.at - start;
  const b1 = interpolate(t, [g0, g0 + 0.5], [0, 100], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const b2 = interpolate(t, [g1, g1 + 0.3], [0, Math.max(2, after.ratio * 100)], {...CLAMP, easing: Easing.out(Easing.cubic)});
  const row = (label: string, value: string, w: number, color: string, show: boolean) => (
    <div style={{marginTop: 26}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: UI, fontWeight: 800, fontSize: 38, opacity: show ? 1 : 0.35}}>
        <span>{label}</span><span style={{color}}>{show ? value : ''}</span>
      </div>
      <div style={{height: 34, borderRadius: 20, background: 'rgba(127,127,127,.25)', marginTop: 10, overflow: 'hidden'}}>
        <div style={{width: `${w}%`, height: '100%', borderRadius: 20, background: color}} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 66, top: 1080, width: 760, padding: 40, ...glass(),
        opacity: Math.min(1, card * 2), transform: `scale(${0.7 + 0.3 * card})`}}>
        <div style={{fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: '0.14em', opacity: 0.85, textTransform: 'uppercase'}}>{title}</div>
        {row(before.label, before.value, b1, THEME.glass.text, t >= g0)}
        {row(after.label, after.value, b2, COLOR.yellow, t >= g1)}
      </div>
    </AbsoluteFill>
  );
};
