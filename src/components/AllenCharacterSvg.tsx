import { useEffect, useId, useMemo, useRef } from 'react';
import type {
  AllenCharacterId,
  AvatarExpression,
  AvatarState,
} from '../shared/tutorConfig';
import type { LiveVoiceTelemetry } from '../services/liveVoiceClient';

export type AllenExpression = 'joy' | 'listening' | 'thinking' | 'talking';

interface AllenCharSpec {
  id: AllenCharacterId;
  name: string;
  anim: 'allen-bob' | 'allen-hop' | 'allen-tilt' | 'allen-sway';
  ink: string;
  cx: number;
  ey: number;
  my: number;
  mm: number;
  pal: [string, string, string, string];
  bb: [number, number, number, number];
  shape: string;
  hl: string;
  back: string;
  front: string;
}

interface AllenEyeSpec {
  rx: number;
  ry: number;
  pr: number;
  pc: string;
  brow?: boolean;
  lid?: boolean;
  down?: boolean;
  lash?: boolean;
}

interface ExprMouthSpec {
  sm: number;
  fl: number;
  rx: number;
  dx: number;
}

const EXPR_SPECS: Record<AllenExpression, ExprMouthSpec> = {
  joy: { sm: 14, fl: 0.22, rx: 15, dx: 0 },
  listening: { sm: 9, fl: 0, rx: 14, dx: 0 },
  thinking: { sm: 2, fl: 0, rx: 10, dx: 7 },
  talking: { sm: 11, fl: 0, rx: 15, dx: 0 },
};

/* ---------- Exact SVG shading & limb builders from ALLEN Characters ---------- */
const S = (c: string, w = 18) =>
  `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;

const hx = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const mix = (h: string, t: string, f: number) =>
  '#' +
  hx(h)
    .map((v, i) =>
      Math.round(v + (hx(t)[i] - v) * f)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');

const dk = (h: string, f = 0.3) => mix(h, '#0a0a30', f);
const lt = (h: string, f = 0.4) => mix(h, '#ffffff', f);

const L = (d: string, c: string, w = 18) =>
  `<path d="${d}" ${S('#1a1050', w)} opacity=".2" transform="translate(3 5)" filter="url(#__P__bl3)"/>` +
  `<path d="${d}" ${S(dk(c), w)}/>` +
  `<path d="${d}" ${S(c, w - 5)}/>` +
  `<path d="${d}" ${S(lt(c, 0.5), 4)} opacity=".55" transform="translate(-2.5 -2)" filter="url(#__P__bl2)"/>`;

const B = (x: number, y: number, rx: number, ry: number, c: string, rot = 0) => {
  const t = rot ? ` transform="rotate(${rot} ${x} ${y})"` : '';
  return (
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${dk(c)}"${t}/>` +
    `<ellipse cx="${x - 1}" cy="${y - 1.5}" rx="${rx - 2.2}" ry="${ry - 2.2}" fill="${c}"${t}/>` +
    `<ellipse cx="${x - rx * 0.28}" cy="${y - ry * 0.4}" rx="${rx * 0.45}" ry="${ry * 0.26}" fill="#fff" opacity=".38" filter="url(#__P__bl2)"${t}/>`
  );
};

const FG = (x: number, y: number, c: string, a: number) =>
  [-38, 0, 38]
    .map((o) => {
      const r = ((a + o) * Math.PI) / 180;
      return L(
        `M${x} ${y}L${(x + Math.cos(r) * 17).toFixed(1)} ${(y + Math.sin(r) * 17).toFixed(1)}`,
        c,
        8
      );
    })
    .join('');

const G = (s: string, ox: number, oy: number, cls: string, dl = 0) =>
  `<g class="${cls}" style="transform-origin:${ox}px ${oy}px;animation-delay:${dl}s">${s}</g>`;

const SP = (c: string, p: string) => `<g class="allen-spark" ${S(c, 6)}>${p}</g>`;

const HL = (x: number, y: number, rx: number, ry: number, rot: number, op = 0.42) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" filter="url(#__P__bl6)" transform="rotate(${rot} ${x} ${y})"/>` +
  `<ellipse cx="${x - rx * 0.2}" cy="${y - ry * 0.2}" rx="${rx * 0.4}" ry="${ry * 0.35}" fill="#fff" opacity=".5" filter="url(#__P__bl2)" transform="rotate(${rot} ${x} ${y})"/>`;

const BL = '#0a5fe0';
const BH = '#1a78ff';
const TQ = '#0a9bb5';
const TH = '#13c0d8';
const PU = '#7228d8';
const PK = '#ff3a62';
const OR = '#ff8f10';
const GL = '#6fcf3a';
const GH = '#8bd92f';

const ALLEN_CHARS: Record<AllenCharacterId, AllenCharSpec> = {
  daniel: {
    id: 'daniel',
    name: 'Daniel',
    anim: 'allen-bob',
    ink: '#12297a',
    cx: 120,
    ey: 118,
    my: 141,
    mm: 12,
    pal: ['#35b4ff', '#0a8cff', '#0066e0', '#00237a'],
    bb: [46, 51, 148, 148],
    shape: `<circle cx="120" cy="125" r="74" fill="{F}"/>`,
    hl: HL(93, 84, 32, 15, -32),
    back:
      G(L('M100 190V256', '#0a4fd0', 20) + B(92, 267, 23, 11, '#12297a'), 100, 190, 'allen-step') +
      G(
        L('M146 190V256', '#0a4fd0', 20) + B(156, 267, 23, 11, '#12297a'),
        146,
        190,
        'allen-step',
        -0.7
      ),
    front:
      `<g transform="rotate(8 90 205)"><rect x="62" y="168" width="52" height="68" rx="7" fill="#1b2e7a"/><rect x="62" y="168" width="52" height="22" rx="7" fill="#fff" opacity=".12"/><rect x="107" y="172" width="6" height="60" rx="2" fill="#fff" opacity=".85"/></g>` +
      L('M62 150Q34 176 62 206', BL, 16) +
      B(70, 206, 13, 12, BH) +
      B(84, 198, 7, 6, BH) +
      G(
        L('M180 150Q212 150 210 114', BL, 16) +
          FG(210, 100, BH, -90) +
          B(210, 106, 15, 14, BH) +
          B(194, 108, 7, 6, BH),
        180,
        150,
        'allen-wave'
      ) +
      `<path d="M120 22L198 50L120 78L42 50Z" fill="#1c3d9e"/><path d="M120 22L198 50L168 62L120 40Z" fill="#fff" opacity=".13"/><path d="M92 65V84Q120 100 148 84V65Q120 80 92 65Z" fill="#0f2368"/><path d="M58 54L50 92" stroke="#ffc01f" stroke-width="3"/>` +
      B(50, 96, 6, 6, '#ffc01f'),
  },

  marcus: {
    id: 'marcus',
    name: 'Marcus',
    anim: 'allen-sway',
    ink: '#12297a',
    cx: 120,
    ey: 128,
    my: 152,
    mm: 10,
    pal: ['#3fe6f2', '#12bccf', '#0193ac', '#00505f'],
    bb: [21, 24, 198, 196],
    shape: `<polygon points="120,33 148,89 210,99 166,143 176,205 120,176 64,205 74,143 30,99 92,89" fill="{F}" stroke="{F}" stroke-width="18" stroke-linejoin="round"/>`,
    hl: HL(112, 66, 20, 10, -20),
    back:
      G(L('M102 200V257', TQ, 20) + B(94, 267, 23, 11, '#0b7f96'), 102, 200, 'allen-step') +
      G(L('M142 200V257', TQ, 20) + B(152, 267, 23, 11, '#0b7f96'), 142, 200, 'allen-step', -0.7),
    front:
      `<g fill="none" stroke="#12297a" stroke-width="5"><circle cx="94" cy="128" r="23"/><circle cx="146" cy="128" r="23"/><path d="M117 126h6"/></g><ellipse cx="85" cy="116" rx="7" ry="3" fill="#fff" opacity=".3" transform="rotate(-30 85 116)"/><ellipse cx="137" cy="116" rx="7" ry="3" fill="#fff" opacity=".3" transform="rotate(-30 137 116)"/>` +
      L('M52 166Q26 190 56 212', TQ, 16) +
      `<g transform="rotate(-12 62 195)"><rect x="32" y="168" width="64" height="50" rx="8" fill="#a79bc8"/><rect x="32" y="168" width="64" height="18" rx="8" fill="#fff" opacity=".2"/><circle cx="64" cy="193" r="5" fill="#e6e0f5"/></g>` +
      B(60, 212, 13, 12, TH) +
      G(L('M184 150Q230 168 194 202', TQ, 16) + B(194, 204, 12, 12, TH), 184, 150, 'allen-sw'),
  },

  laura: {
    id: 'laura',
    name: 'Laura',
    anim: 'allen-bob',
    ink: '#3b1470',
    cx: 120,
    ey: 132,
    my: 156,
    mm: 11,
    pal: ['#c58bff', '#a051f5', '#7d36d8', '#2a0f6e'],
    bb: [34, 34, 172, 184],
    shape: `<path d="M126 34C170 34 206 80 206 140C206 192 170 218 120 218C70 218 34 192 34 142C34 82 76 34 126 34Z" fill="{F}"/>`,
    hl: HL(98, 78, 28, 13, -35),
    back: '',
    front:
      L('M52 198Q20 208 28 164', PU, 16) +
      `<circle cx="28" cy="152" r="11" ${S('#4b24a8', 8)}/><circle cx="28" cy="152" r="11" ${S('#9a55ef', 5)}/>` +
      L('M188 198Q220 208 212 164', PU, 16) +
      `<circle cx="212" cy="152" r="11" ${S('#4b24a8', 8)}/><circle cx="212" cy="152" r="11" ${S('#9a55ef', 5)}/>` +
      `<path d="M34 234Q48 198 120 203Q192 198 206 234Q192 268 120 264Q48 268 34 234Z" fill="#6440c5"/><path d="M34 234Q48 198 120 203Q192 198 206 234Q192 268 120 264Q48 268 34 234Z" fill="url(#__P__cu-laura)"/><path d="M40 238Q82 252 120 236Q158 252 200 238" ${S('#3f239a', 5)}/><ellipse cx="86" cy="218" rx="30" ry="6" fill="#fff" opacity=".22" filter="url(#__P__bl3)"/>` +
      SP('#c58bff', '<path d="M196 44L206 62"/><path d="M218 74L234 82"/>'),
  },

  sofia: {
    id: 'sofia',
    name: 'Sofia',
    anim: 'allen-hop',
    ink: '#7a0f2a',
    cx: 120,
    ey: 122,
    my: 146,
    mm: 13,
    pal: ['#ff5f88', '#fd2a55', '#f00c36', '#6e0018'],
    bb: [24, 55, 198, 161],
    shape: `<path d="M120 216C18 150 24 70 75 60C100 55 118 70 120 86C122 70 140 55 165 60C216 70 222 150 120 216Z" fill="{F}"/>`,
    hl: HL(78, 86, 22, 11, -35),
    back:
      G(L('M98 192L66 236', PK, 18) + B(58, 247, 22, 10, PK, -20), 98, 192, 'allen-step') +
      G(L('M142 192L178 236', PK, 18) + B(188, 245, 22, 10, PK, 20), 142, 192, 'allen-step', -0.7),
    front:
      G(
        L('M60 140L20 112', PK, 16) + FG(14, 108, PK, -150) + B(14, 108, 12, 12, PK),
        60,
        140,
        'allen-sw'
      ) +
      G(
        L('M180 140L222 112', PK, 16) + FG(228, 108, PK, -30) + B(228, 108, 12, 12, PK),
        180,
        140,
        'allen-sw',
        -1
      ) +
      SP(
        '#ff5c7c',
        '<path d="M96 30L92 8"/><path d="M118 28L128 8"/><path d="M142 38L160 26"/>'
      ),
  },

  leo: {
    id: 'leo',
    name: 'Leo',
    anim: 'allen-tilt',
    ink: '#7a2d00',
    cx: 124,
    ey: 118,
    my: 142,
    mm: 14,
    pal: ['#ffc533', '#ff9a0a', '#f45f00', '#7a2400'],
    bb: [53, 37, 143, 178],
    shape: `<path d="M120 40C170 34 196 80 193 140C191 190 160 214 118 212C72 210 52 170 56 120C60 70 84 44 120 40Z" fill="{F}"/>`,
    hl: HL(100, 72, 26, 12, -35),
    back:
      G(L('M102 205L84 256', OR, 20) + B(76, 267, 22, 11, OR), 102, 205, 'allen-step') +
      G(L('M148 200L178 236', OR, 20) + B(190, 242, 22, 11, OR, -30), 148, 200, 'allen-step', -0.7),
    front:
      G(L('M62 168Q36 182 22 160', OR, 16) + B(20, 154, 14, 14, OR), 62, 168, 'allen-sw') +
      G(L('M190 128Q216 118 212 84', OR, 16) + B(212, 74, 14, 14, OR), 190, 128, 'allen-sw', -1) +
      L('M66 100C60 18 180 14 186 96', '#1b3a9a', 10) +
      `<rect x="48" y="84" width="26" height="54" rx="13" fill="#12297a"/><rect x="176" y="78" width="26" height="54" rx="13" fill="#12297a"/><rect x="53" y="90" width="7" height="30" rx="3.5" fill="#fff" opacity=".25"/><rect x="181" y="84" width="7" height="30" rx="3.5" fill="#fff" opacity=".25"/>` +
      SP('#ffc01f', '<path d="M196 36L204 14"/><path d="M218 48L236 34"/>'),
  },

  mia: {
    id: 'mia',
    name: 'Mia',
    anim: 'allen-bob',
    ink: '#0d4a1a',
    cx: 120,
    ey: 140,
    my: 163,
    mm: 13,
    pal: ['#a8ea48', '#72cf3a', '#0aae7e', '#03493d'],
    bb: [36, 54, 164, 158],
    shape: `<g fill="{F}"><circle cx="120" cy="96" r="42"/><circle cx="78" cy="128" r="40"/><circle cx="162" cy="128" r="40"/><circle cx="120" cy="150" r="62"/><circle cx="84" cy="176" r="36"/><circle cx="156" cy="176" r="36"/></g>`,
    hl: HL(104, 68, 22, 11, -30),
    back:
      G(
        L('M104 205L88 256', '#18a97a', 20) + B(80, 267, 24, 10, '#139a6e', -8),
        104,
        205,
        'allen-step'
      ) +
      G(
        L('M142 205L164 258', '#18a97a', 20) + B(172, 268, 24, 10, '#139a6e', 10),
        142,
        205,
        'allen-step',
        -0.7
      ),
    front:
      L('M72 162Q42 180 50 210', GL, 16) +
      B(50, 212, 10, 10, GL) +
      G(
        L('M174 156Q210 146 208 106', GL, 16) + FG(208, 96, GH, -90) + B(208, 96, 14, 14, GH),
        174,
        156,
        'allen-wave'
      ) +
      SP('#a6e22e', '<path d="M40 60L52 76"/><path d="M26 82L44 88"/>'),
  },
};

const EYE_SPECS: Record<AllenCharacterId, AllenEyeSpec> = {
  daniel: { rx: 12, ry: 14, pr: 6.5, pc: '#12297a', brow: true },
  marcus: { rx: 9, ry: 11, pr: 5, pc: '#0d2a52' },
  laura: { rx: 12, ry: 13, pr: 7, pc: '#3b1470', lid: true, down: true },
  sofia: { rx: 11, ry: 14, pr: 7, pc: '#7a0f2a', lash: true },
  leo: { rx: 14, ry: 16, pr: 8, pc: '#7a2d00', brow: true },
  mia: { rx: 14, ry: 16, pr: 8.5, pc: '#0d4a1a', lash: true },
};

function buildEyesMarkup(d: AllenCharSpec): string {
  const e = EYE_SPECS[d.id];
  const y = d.ey;
  const ink = d.ink;
  const w = e.rx + 1;
  const op = (x: number, sd: number) =>
    `<g class="allen-eye ${sd < 0 ? 'l' : 'r'}"><ellipse cx="${x}" cy="${y}" rx="${e.rx}" ry="${e.ry}" fill="#fff" stroke="${ink}" stroke-opacity=".3" stroke-width="1.5"/><g class="allen-pupil"><circle cx="${x}" cy="${y + 1}" r="${e.pr}" fill="${e.pc}"/><circle cx="${x + e.pr * 0.4}" cy="${y - e.pr * 0.35}" r="${e.pr * 0.36}" fill="#fff"/></g>${
      e.lid ? `<path d="M${x - w} ${y - 1}Q${x} ${y - e.ry - 6} ${x + w} ${y - 1}" ${S(ink, 4)}/>` : ''
    }${
      e.lash
        ? `<path d="M${x + sd * e.rx} ${y - 5}l${sd * 6} -5M${x + sd * (e.rx - 1)} ${y - 10}l${sd * 5} -6" ${S(ink, 3)}/>`
        : ''
    }</g>`;

  const cl = (x: number, sd: number) =>
    `<path d="${
      e.down
        ? `M${x - w} ${y - 3}Q${x} ${y + 11} ${x + w} ${y - 3}`
        : `M${x - w} ${y + 5}Q${x} ${y - 10} ${x + w} ${y + 5}`
    }" ${S(ink, 5)}/>${
      e.lash ? `<path d="M${x + sd * w} ${y + 4}l${sd * 6} -3" ${S(ink, 3)}/>` : ''
    }`;

  const brow = e.brow
    ? [-26, 26]
        .map(
          (o) =>
            `<path d="M${d.cx + o - 10} ${y - e.ry - 9}Q${d.cx + o} ${y - e.ry - 14} ${d.cx + o + 10} ${y - e.ry - 9}" ${S(ink, 4)}/>`
        )
        .join('')
    : '';

  return (
    `<g class="allen-eyes-open">${op(d.cx - 26, -1)}${op(d.cx + 26, 1)}</g>` +
    `<g class="allen-eyes-closed">${cl(d.cx - 26, -1)}${cl(d.cx + 26, 1)}</g>${brow}`
  );
}

function buildDefsMarkup(d: AllenCharSpec, prefix: string): string {
  const [x, y, w, h] = d.bb;
  const R = Math.max(w, h);
  const p = d.pal;
  const shape = (f: string) => d.shape.replace(/\{F\}/g, f);
  const fx = [
    ['bl2', '1.5'],
    ['bl3', '3'],
    ['bl6', '6'],
  ]
    .map(
      ([i, v]) =>
        `<filter id="${prefix}${i}" filterUnits="userSpaceOnUse" x="-60" y="-60" width="360" height="420"><feGaussianBlur stdDeviation="${v}"/></filter>`
    )
    .join('');

  return (
    `${fx}` +
    `<radialGradient id="${prefix}b" gradientUnits="userSpaceOnUse" cx="${x + w * 0.34}" cy="${y + h * 0.26}" r="${R * 0.95}"><stop offset="0" stop-color="${p[0]}"/><stop offset=".5" stop-color="${p[1]}"/><stop offset="1" stop-color="${p[2]}"/></radialGradient>` +
    `<radialGradient id="${prefix}ao" gradientUnits="userSpaceOnUse" cx="${x + w * 0.45}" cy="${y + h * 0.38}" r="${R * 0.62}"><stop offset=".7" stop-color="${p[3]}" stop-opacity="0"/><stop offset="1" stop-color="${p[3]}" stop-opacity=".42"/></radialGradient>` +
    `<radialGradient id="${prefix}bn" gradientUnits="userSpaceOnUse" cx="${x + w * 0.62}" cy="${y + h * 1.02}" r="${R * 0.4}"><stop offset="0" stop-color="${lt(p[1], 0.55)}" stop-opacity=".5"/><stop offset="1" stop-color="${p[1]}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${prefix}cu-laura" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5be0" stop-opacity=".5"/><stop offset="1" stop-color="#3f239a" stop-opacity=".5"/></linearGradient>` +
    `<mask id="${prefix}mk" maskUnits="userSpaceOnUse" x="-20" y="-20" width="280" height="330">${shape('#fff')}</mask>`
  );
}

function resolveAllenExpression(
  avatarState: AvatarState,
  expression: AvatarExpression
): AllenExpression {
  if (expression === 'congratulation') return 'joy';
  if (avatarState === 'SPEAKING') return 'talking';
  if (avatarState === 'LISTENING') return 'listening';
  if (avatarState === 'THINKING') return 'thinking';
  if (expression === 'joy') return 'joy';
  if (expression === 'concentration') return 'thinking';
  return 'talking';
}

function computeMouthPaths(
  d: AllenCharSpec,
  expr: AllenExpression,
  level: number
): { pathD: string; cx: number; cy: number; rx: number; ry: number; tongueOpacity: number } {
  const s = EXPR_SPECS[expr];
  const v = Math.max(level, s.fl);
  const y = d.my;
  const x = d.cx + s.dx;
  const rx = s.rx - v * 2;
  const top = y - v * d.mm * 1.5;
  const bot = y + s.sm + v * d.mm * 1.7;
  return {
    pathD: `M${(x - rx).toFixed(2)} ${y}Q${x} ${top.toFixed(2)} ${(x + rx).toFixed(2)} ${y}Q${x} ${bot.toFixed(2)} ${(x - rx).toFixed(2)} ${y}Z`,
    cx: x,
    cy: y + (bot - y) / 2 - v * 3,
    rx: 8,
    ry: Math.max(0.1, v * 5),
    tongueOpacity: v > 0.3 ? 0.95 : 0,
  };
}

interface AllenCharacterSvgProps {
  characterId: AllenCharacterId;
  avatarState: AvatarState;
  expression: AvatarExpression;
  sampleAudio?: () => LiveVoiceTelemetry;
  staticPreview?: boolean;
  className?: string;
}

export function AllenCharacterSvg({
  characterId,
  avatarState,
  expression,
  sampleAudio,
  staticPreview = false,
  className = '',
}: AllenCharacterSvgProps) {
  const rawUid = useId();
  const prefix = useMemo(
    () => `ac_${rawUid.replace(/[^a-zA-Z0-9_]/g, '')}_`,
    [rawUid]
  );

  const spec = ALLEN_CHARS[characterId] ?? ALLEN_CHARS.daniel;
  const allenExpr = resolveAllenExpression(avatarState, expression);

  const mouthRef = useRef<SVGPathElement | null>(null);
  const tongueRef = useRef<SVGEllipseElement | null>(null);

  const specRef = useRef(spec);
  const exprRef = useRef<AllenExpression>(allenExpr);
  const avatarStateRef = useRef<AvatarState>(avatarState);
  const sampleAudioRef = useRef(sampleAudio);

  specRef.current = spec;
  exprRef.current = allenExpr;
  avatarStateRef.current = avatarState;
  sampleAudioRef.current = sampleAudio;

  // Build static SVG inner layers once per character + unique prefix
  const svgLayers = useMemo(() => {
    const injectPrefix = (str: string) => str.replace(/__P__/g, prefix);
    const bodyHtml =
      `<g>${spec.shape.replace(/\{F\}/g, `url(#${prefix}b)`)}</g>` +
      `<g mask="url(#${prefix}mk)"><rect x="-20" y="-20" width="280" height="330" fill="url(#${prefix}ao)"/><rect x="-20" y="-20" width="280" height="330" fill="url(#${prefix}bn)"/></g>` +
      injectPrefix(spec.hl);
    return {
      defsHtml: buildDefsMarkup(spec, prefix),
      backHtml: injectPrefix(spec.back),
      bodyHtml,
      eyesHtml: buildEyesMarkup(spec),
      frontHtml: injectPrefix(spec.front),
    };
  }, [spec, prefix]);

  // Smooth 60fps real-time audio lip-sync directly on SVG mouth + tongue attributes (zero React re-renders!)
  useEffect(() => {
    const applyMouth = (level: number) => {
      const m = mouthRef.current;
      const t = tongueRef.current;
      if (!m || !t) return;
      const geom = computeMouthPaths(specRef.current, exprRef.current, level);
      m.setAttribute('d', geom.pathD);
      t.setAttribute('cx', geom.cx.toFixed(2));
      t.setAttribute('cy', geom.cy.toFixed(2));
      t.setAttribute('rx', String(geom.rx));
      t.setAttribute('ry', geom.ry.toFixed(2));
      t.setAttribute('opacity', String(geom.tongueOpacity));
    };

    if (staticPreview) {
      applyMouth(0);
      return;
    }

    let rafId = 0;
    let cur = 0;
    const startMs = performance.now();

    const tick = (nowMs: number) => {
      rafId = window.requestAnimationFrame(tick);
      let target = 0;
      const state = avatarStateRef.current;
      if (sampleAudioRef.current) {
        const tel = sampleAudioRef.current();
        if (state === 'SPEAKING') {
          const raw = Math.max(tel.lipOpen, tel.visemes.jawOpen * 0.95, tel.tutorLevel * 0.9);
          const tSec = (nowMs - startMs) / 1000;
          const gentleFloor = raw < 0.05 ? 0.08 + 0.06 * Math.abs(Math.sin(tSec * 9.5)) : 0;
          target = Math.max(0, Math.min(1, Math.max(raw * 1.25, gentleFloor)));
        }
      } else if (state === 'SPEAKING') {
        const tSec = (nowMs - startMs) / 1000;
        target = Math.max(0, Math.min(1, 0.28 + 0.36 * Math.abs(Math.sin(tSec * 7.8))));
      }

      // Exact spring smoothing ratio (0.45) from ALLEN Characters HTML
      const next = cur + (target - cur) * 0.45;
      if (Math.abs(next - cur) > 0.002 || Math.abs(target - cur) > 0.002) {
        cur = next;
        applyMouth(cur);
      }
    };

    applyMouth(0);
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [characterId, allenExpr, staticPreview]);

  const initialMouth = computeMouthPaths(spec, allenExpr, 0);

  return (
    <svg
      className={`allen-dot select-none ${className}`}
      viewBox="0 0 240 290"
      role="img"
      aria-label={spec.name}
      data-id={spec.id}
      data-eyes="open"
      data-expr={allenExpr}
    >
      <defs dangerouslySetInnerHTML={{ __html: svgLayers.defsHtml }} />
      {/* Soft grounded studio floor shadow */}
      <ellipse
        cx="120"
        cy="281"
        rx="78"
        ry="9"
        fill={spec.pal[3]}
        opacity="0.28"
        filter={`url(#${prefix}bl6)`}
      />
      <ellipse
        cx="120"
        cy="280"
        rx="48"
        ry="4"
        fill={spec.pal[3]}
        opacity="0.38"
        filter={`url(#${prefix}bl3)`}
      />
      <g className="allen-pose">
        <g className={staticPreview ? '' : spec.anim}>
          <g dangerouslySetInnerHTML={{ __html: svgLayers.backHtml }} />
          <g dangerouslySetInnerHTML={{ __html: svgLayers.bodyHtml }} />
          <g dangerouslySetInnerHTML={{ __html: svgLayers.eyesHtml }} />
          <path
            ref={mouthRef}
            className="allen-mouth"
            d={initialMouth.pathD}
            fill={spec.ink}
            stroke={spec.ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          <ellipse
            ref={tongueRef}
            className="allen-tongue"
            cx={initialMouth.cx}
            cy={initialMouth.cy}
            rx={initialMouth.rx}
            ry={initialMouth.ry}
            fill="#ff6b6b"
            opacity={initialMouth.tongueOpacity}
          />
          <g dangerouslySetInnerHTML={{ __html: svgLayers.frontHtml }} />
        </g>
      </g>
    </svg>
  );
}

/** Crisp miniature badge using the real ALLEN SVG Character silhouette for tutor selector pills */
export function MiniAllenCharacterBadge({
  characterId,
  className = 'w-8 h-8',
}: {
  characterId: AllenCharacterId;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 overflow-visible ${className}`}
    >
      <AllenCharacterSvg
        characterId={characterId}
        avatarState="IDLE"
        expression="neutral"
        staticPreview
        className="w-full h-full"
      />
    </span>
  );
}
