/**
 * Rewrite the maid-atelier CSS into the Hakurei Shrine skin CSS:
 *  1. blanket rename maid -> hakurei (attrs, vars, keyframes, classes)
 *  2. remap the deep-sea navy/periwinkle palette to shrine vermilion /
 *     paper-white / gold (explicit table + HSL warm remap fallback)
 *  3. tune the character stage for Reimu's wider 2:3 standing art
 *  4. add the hero banner rule for 横幅.png
 * Run: node tools/rewrite-css.cjs
 */
'use strict'
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const src = path.join(ROOT, 'src', 'client', 'maid-atelier.module.css')
const dst = path.join(ROOT, 'src', 'client', 'hakurei.module.css')

/* ---------------- palette helpers ---------------- */
function hexToRgb(hex) {
  const v = hex.replace('#', '')
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
function rgbToHex(r, g, b) {
  const c = (x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')
  return '#' + c(r) + c(g) + c(b)
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [h, s, l]
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
}

/* explicit curated overrides (hex -> hex) */
const OVERRIDES = {
  '#172347': '#3a2418', '#243866': '#5a3020', '#4d5d7f': '#7a5a42', '#6f7c99': '#9a7a5e', '#8a94aa': '#b39a80',
  '#526aa8': '#c8442f', '#536eae': '#c8442f', '#405a99': '#a83420', '#56678c': '#8a5a3c', '#314979': '#7a3a24',
  '#294587': '#a83420', '#6079b5': '#c8442f', '#6680bd': '#d04a30', '#304a91': '#a83420', '#4d6bab': '#c8442f',
  '#d3a957': '#cfa334', '#7896d4': '#d8a864', '#385a9e': '#b83a24', '#2f4f91': '#a83420', '#4264a9': '#c03c28',
  '#29477f': '#94301e', '#4e638f': '#8a5a3c', '#243966': '#5a3020', '#142044': '#3a2418', '#233663': '#5a3020',
  '#344a75': '#6a442c', '#50638c': '#8a5a3c', '#6d7994': '#9a7a5e', '#a1a8b8': '#b39a80', '#52658c': '#8a5a3c',
  '#74809a': '#9a7a5e', '#344b78': '#6a442c', '#15234a': '#3a2418',
  '#dce6f5': '#f6efe2', '#e2e8f5': '#f0e2c8', '#e1e7f5': '#f5e9d4', '#e5eaf6': '#f6efe2', '#edf1fa': '#faf5ea',
  '#ece6d8': '#f0e2c8',
  '#e7ecf7': '#f0e6d2', '#d5dff3': '#e2d4bc', '#bdc9e3': '#c8b89e', '#96a6c9': '#a8987e', '#7f90b4': '#8c7c66',
  '#9bb0e1': '#e8a074', '#a3b7e5': '#f0b090', '#8ca4dc': '#e89060', '#293d73': '#3a2c50', '#354d88': '#4a3a58',
  '#c6d1e9': '#c8b89e', '#dbe4f7': '#e2d4bc', '#a2b1d0': '#a8987e', '#8798bd': '#8c7c66', '#66769a': '#70604c',
  '#afbddb': '#a8987e', '#b5c1dd': '#b3a088', '#d7def0': '#d8c8ae', '#96a8ce': '#a8987e',
  '#e1c17d': '#e0b65c', '#e7d19e': '#e6cf9a', '#efd79e': '#e6cf9a', '#f2e7cf': '#f0e6d2', '#f6eedf': '#f4ead8',
  '#fffaf0': '#fdf8ee',
  '#0a173b': '#2a110f', '#0b193f': '#2c1210', '#10204d': '#3c1a12', '#152246': '#402016', '#1c326b': '#54241a',
  '#080f27': '#171126', '#091333': '#2b1210', '#293f78': '#5e2a1e', '#24345c': '#4a2418', '#1a356f': '#54241a',
  '#a9bce8': '#d8b088', '#5e79b9': '#c8442f', '#405d9e': '#b83a24', '#8299d0': '#d8a864',
  '#f8f6f0': '#faf5ea', '#f8f3e8': '#faf5ea', '#c5a468': '#cfa334', '#e2cfaa': '#e6cf9a',
  '#ad894b': '#cfa334', '#a77c36': '#b8872a', '#d8bd82': '#e0b65c', '#d4a951': '#cfa334', '#d9b76f': '#d9b76f',
  '#526487': '#8a5a3c', '#6f86be': '#c8442f', '#e2bd6e': '#e2bd6e', '#fff0c5': '#fff0c5', '#ffe7ad': '#ffe7ad',
  '#d9ad62': '#d9ad62', '#f0d99f': '#f0d99f', '#dfbd73': '#dfbd73', '#c99a43': '#c99a43',
  '#aeb9d3': '#b3a088', '#d8bc80': '#d8bc80', '#f2dfba': '#f2dfba', '#e8c77f': '#e8c77f', '#efd7a1': '#efd7a1',
  '#f3e3c0': '#f3e3c0', '#fff4d9': '#fff4d9', '#fff1ce': '#fff1ce', '#fff8e8': '#fff8e8', '#fff1cf': '#fff1cf',
  '#ebd29e': '#ebd29e', '#d7c8a8': '#d7c8a8', '#ead29c': '#ead29c', '#d7b46a': '#d7b46a', '#e6c77e': '#e6c77e',
  '#d9bd83': '#d9bd83', '#c8b891': '#c8b891', '#f4ead5': '#f4ead5', '#f0dfba': '#f0dfba',
  '#d7dfef': '#d8c8ae', '#8f9fc2': '#a8987e', '#e2eaf6': '#f6efe2',
}

function remapTriplet(r, g, b) {
  const key = rgbToHex(r, g, b).toLowerCase()
  if (OVERRIDES[key]) return hexToRgb(OVERRIDES[key])
  // warm grays: nudge toward paper
  if (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) {
    return [Math.min(255, r + 6), Math.min(255, g + 2), Math.max(0, b - 8)]
  }
  // blue-dominant colors: warm remap by lightness band
  if (b > r + 6) {
    const [h, s, l] = rgbToHsl(r, g, b)
    if (l < 0.22) return hslToRgb(350, Math.min(0.62, s + 0.12), l).map(Math.round)
    if (l < 0.55) return hslToRgb(12, Math.min(0.66, s + 0.2), l).map(Math.round)
    return hslToRgb(40, Math.min(0.24, s * 0.55), l).map(Math.round)
  }
  return [r, g, b]
}
function remapHex(hex) {
  const key = hex.toLowerCase()
  if (OVERRIDES[key]) return OVERRIDES[key]
  const [r, g, b] = hexToRgb(hex)
  if (!(b > r + 6) && !(Math.abs(r - g) < 10 && Math.abs(g - b) < 10)) return hex
  const [nr, ng, nb] = remapTriplet(r, g, b)
  return rgbToHex(nr, ng, nb)
}
function remapRgba(m, r, g, b, a) {
  const [nr, ng, nb] = remapTriplet(parseInt(r, 10), parseInt(g, 10), parseInt(b, 10))
  return 'rgba(' + nr + ', ' + ng + ', ' + nb + (a !== undefined ? ', ' + a : '') + ')'
}

let css = fs.readFileSync(src, 'utf8')

/* 1. rename maid -> hakurei everywhere (attrs, vars, keyframes, ids) */
css = css.split('maid').join('hakurei')
css = css.split('data-dsh-hakurei-atelier').join('data-dsh-hakurei')

/* 2. palette remap */
const hexRe = /#[0-9a-fA-F]{6}/g
css = css.replace(hexRe, (m) => remapHex(m.toLowerCase()))
const rgbaRe = /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)/g
css = css.replace(rgbaRe, remapRgba)
const rgbRe = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/g
css = css.replace(rgbRe, (m, r, g, b) => {
  const [nr, ng, nb] = remapTriplet(parseInt(r, 10), parseInt(g, 10), parseInt(b, 10))
  return 'rgb(' + nr + ', ' + ng + ', ' + nb + ')'
})

/* 3. character stage tuning for Reimu's 2:3 art (wider than the maids) */
css = css.replace('height: clamp(560px, 96vh, 1180px);', 'height: clamp(480px, 82vh, 1000px);')
css = css.replace('height: clamp(540px, 92vh, 1120px);', 'height: clamp(440px, 74vh, 920px);')
css = css.replace('height: clamp(420px, 64vh, 760px);', 'height: clamp(360px, 58vh, 660px);')
css = css.replace('height: clamp(420px, 62vh, 730px);', 'height: clamp(340px, 55vh, 640px);')
/* mascot: Reimu portrait needs a taller cap to keep the bust visible */
css = css.replace('max-height: 38%;', 'max-height: 44%;')

/* 4. hero banner rule (横幅.png on the landing page, main-pane centered) */
css += '\n' + [
'/* Touhou banner (横幅.png) floats above the hero composer, centered on the main pane. */',
'body[data-dsh-hakurei] [data-skin-chrome=\'hero-banner\'] {',
'  position: fixed;',
'  top: calc(var(--hakurei-titlebar-height, 0px) + 12px);',
'  left: 50%;',
'  translate: calc(-50% + var(--hakurei-sidebar-width) / 2) 0;',
'  z-index: 15;',
'  width: min(560px, 46vw);',
'  aspect-ratio: 2172 / 724;',
'  background: var(--hakurei-banner-art) center / contain no-repeat;',
'  pointer-events: none;',
'  opacity: 0;',
'  filter: drop-shadow(0 10px 26px rgba(24, 8, 10, 0.4));',
'  transition: opacity 420ms ease;',
'}',
'body[data-dsh-hakurei]:has([data-phase=\'hero\']) [data-skin-chrome=\'hero-banner\'] {',
'  opacity: 0.97;',
'}',
'body[data-dsh-hakurei][data-ds-dark-theme] [data-skin-chrome=\'hero-banner\'] {',
'  filter: drop-shadow(0 10px 26px rgba(0, 0, 0, 0.5)) brightness(0.92);',
'}',
'@media (max-width: 1080px) {',
'  body[data-dsh-hakurei] [data-skin-chrome=\'hero-banner\'] { width: min(420px, 52vw); }',
'}',
].join('\n')

/* 5. 方框.png sidebar frame — overrides the maid-derived corners layer with
   the user's vertical banner frame art and insets sidebar content so nothing
   hides under the opaque curtain header / vermilion rails / foot band. */
css += '\n' + [
'/* 方框.png — the user\'s vertical banner frame (curtain header with hanging',
'   tassels, vermilion rails, decorated foot band) wraps the whole sidebar.',
'   Full-bleed raster overlay; the artwork\'s center is transparent so the',
'   sidebar content (inset by the clearance rules below) shows through. */',
'body[data-dsh-hakurei] [data-skin-chrome=\'sidebar-corners\'] {',
'  position: absolute;',
'  inset: 0;',
'  z-index: 4;',
'  background: var(--hakurei-sidebar-frame-art) center top / 100% 100% no-repeat;',
'  filter: drop-shadow(3px 0 10px rgba(30, 8, 12, 0.26));',
'  pointer-events: none;',
'}',
'',
'/* The frame art owns its corners; the old curl spans are retired. */',
'body[data-dsh-hakurei] [data-skin-chrome=\'sidebar-corners\'] > [data-skin-corner] {',
'  display: none;',
'}',
'',
'/* 方框.png layout clearance: the curtain header + tassels occupy the top',
'   12.1% of the frame, the rails 8.3% of each side, the foot band the bottom',
'   2.1%. Content is inset by those proportions so nothing hides under the',
'   opaque artwork. */',
'body[data-dsh-hakurei]:not([data-hakurei-sidebar-size=\'rail\']) :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) > div {',
'  padding: 6px 8.3% calc(100vh * 0.0212 + 8px);',
'}',
'',
'body[data-dsh-hakurei] [class*=\'logoRow\'] {',
'  margin-top: calc(100vh * 0.1211 + 6px);',
'}',
'',
'/* Keep the session tree\'s scrollbar inside the frame instead of letting the',
'   region bleed under the right rail. */',
'body[data-dsh-hakurei]:not([data-hakurei-sidebar-size=\'rail\']) :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) [class*=\'regionArea\'] {',
'  margin-right: 0;',
'}',
'',
'/* Settings-open state: the raster frame needs no stroke brightening under',
'   the mask, only its edge shadow relaxed. */',
'body[data-dsh-hakurei]:has(',
'    [data-slot=\'sidebar.settings\']',
'      > :is(button, [role=\'button\'])[aria-expanded=\'true\']',
'  ) [data-skin-chrome=\'sidebar-corners\'] {',
'  filter: drop-shadow(2px 0 6px rgba(30, 8, 12, 0.18));',
'}',
'',
'/* 6. 对话框.png composer frame — nine-slice overrides for the maid-derived',
'   composer ::before. 2172x724 source (uncropped): curtain header top 276,',
'   rails 65 each side, decorated foot band bottom 84; widths are % of the',
'   ::before box so the frame scales with the composer in hero and docked',
'   states. Top bleed is removed so the curtain sits down onto the input box. */',
'body[data-dsh-hakurei] [data-composer-card]::before {',
'  border-width: 0;',
'  border-image-slice: 276 65 84 65;',
'  border-image-width: 38.12% 2.99% 11.6% 2.99%;',
'  inset: 0 -14px -18px;',
'}',
'',
'/* 7. 顶部白/棕缘带不再使用：让神社背景从窗口顶部直接露出。 */',
'body[data-dsh-hakurei] [data-skin-chrome=\'top-trim\'] {',
'  display: none;',
'}',
'',
'/* 8. 侧边栏只保留方框.png 画框：去掉棕色衬板，画框透明中心露出神社背景。 */',
'body[data-dsh-hakurei] :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) {',
'  background: transparent;',
'  box-shadow: none;',
'}',
'body[data-dsh-hakurei] :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) > div {',
'  background: transparent;',
'  box-shadow: none;',
'}',
'body[data-dsh-hakurei]:not([data-hakurei-sidebar-size=\'rail\'])',
'  :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) [class*=\'regionArea\'] {',
'  background: linear-gradient(180deg, rgba(36, 12, 16, 0.42), rgba(36, 12, 16, 0.14) 52%, transparent);',
'}',
'body[data-dsh-hakurei] [class*=\'logoRow\'] {',
'  border-color: rgba(190, 145, 75, 0.6);',
'  background:',
'    linear-gradient(135deg, rgba(253, 248, 238, 0.92), rgba(243, 228, 200, 0.76));',
'  box-shadow:',
'    inset 0 0 0 2px rgba(253, 248, 238, 0.55),',
'    inset 0 0 0 3px rgba(190, 145, 75, 0.32),',
'    0 7px 18px rgba(22, 5, 8, 0.2);',
'}',
'body[data-dsh-hakurei] button[class*=\'brand\'] {',
'  color: #7a3a24;',
'  --dsw-alias-label-primary-inverted: #f3e3c0;',
'}',
'body[data-dsh-hakurei] button[class*=\'brand\'] > svg > rect {',
'  fill: #b8872a;',
'}',
'body[data-dsh-hakurei] button[class*=\'brand\'] > svg {',
'  filter: drop-shadow(0 1px 0 rgba(255, 250, 238, 0.9));',
'}',
'body[data-dsh-hakurei] button[class*=\'brand\']:is(:hover, :focus-visible) > svg {',
'  color: #94301e;',
'}',
'body[data-dsh-hakurei] [class*=\'logoRow\'] [class*=\'toggle\'] {',
'  color: #ebd29e;',
'  background: linear-gradient(145deg, rgba(168, 52, 32, 0.85), rgba(60, 26, 18, 0.9));',
'  box-shadow:',
'    inset 0 0 0 2px rgba(41, 10, 15, 0.7),',
'    0 2px 8px rgba(20, 5, 7, 0.28);',
'}',
'body[data-dsh-hakurei] [class*=\'logoRow\'] [class*=\'toggle\']:is(:hover, :focus-visible) {',
'  color: #fff1ce;',
'  background: linear-gradient(145deg, rgba(200, 68, 47, 0.9), rgba(84, 36, 26, 0.94));',
'}',
'body[data-dsh-hakurei][data-hakurei-sidebar-size=\'rail\']',
'  :is([data-pane=\'sidebar\'], [class*=\'sidebarCol\']) > div {',
'  background:',
'    radial-gradient(circle at 50% 14%, rgba(211, 97, 68, 0.23), transparent 31%),',
'    linear-gradient(180deg, rgba(83, 19, 30, 0.96), rgba(39, 9, 14, 0.95));',
'}',
'',
'/* 9. 朱红按钮板改纸白（新会话/设置）：侧边栏只留画框与纸白控件。 */',
'body[data-dsh-hakurei] button[class*=\'newSession\'] {',
'  color: #8a3a1e;',
'  border: 1px solid rgba(190, 145, 75, 0.55);',
'  border-image-source: none;',
'  border-image-slice: 0;',
'  border-image-width: 0;',
'  border-radius: 10px;',
'  background:',
'    linear-gradient(135deg, rgba(253, 248, 238, 0.92), rgba(243, 228, 200, 0.76));',
'  box-shadow:',
'    inset 0 0 0 2px rgba(253, 248, 238, 0.5),',
'    0 4px 12px rgba(22, 5, 8, 0.2);',
'}',
'body[data-dsh-hakurei]',
'    [data-hakurei-sidebar-footer]',
'    [data-slot=\'sidebar.settings\']',
'    > :is(button, [role=\'button\']) {',
'  color: #8a3a1e;',
'  border: 1px solid rgba(190, 145, 75, 0.55);',
'  border-image-source: none;',
'  border-image-slice: 0;',
'  border-image-width: 0;',
'  border-radius: 10px;',
'  background:',
'    linear-gradient(135deg, rgba(253, 248, 238, 0.92), rgba(243, 228, 200, 0.76));',
'  box-shadow:',
'    inset 0 0 0 2px rgba(253, 248, 238, 0.5),',
'    0 4px 12px rgba(22, 5, 8, 0.2);',
'}',
'body[data-dsh-hakurei]',
'    [data-hakurei-sidebar-footer]',
'    [data-slot=\'sidebar.settings\']',
'    > :is(button, [role=\'button\']) svg {',
'  color: #b8872a;',
'}',
'',
'/* 10. 输入框透明底拉满：卡片不涂背景，画框中间的透明区直接透出神社背景。 */',
'body[data-dsh-hakurei] [data-composer-card] {',
'  background: transparent;',
'  box-shadow: none;',
'}',
'body[data-dsh-hakurei] [data-phase=\'hero\'] [data-composer-card] {',
'  background: transparent;',
'  box-shadow: none;',
'  backdrop-filter: none;',
'  translate: 0 20px;',
'}',
'body[data-dsh-hakurei][data-ds-dark-theme] [data-composer-card] {',
'  background: transparent;',
'  box-shadow: none;',
'}',
'body[data-dsh-hakurei][data-ds-dark-theme] [data-phase=\'hero\'] [data-composer-card] {',
'  background: transparent;',
'  backdrop-filter: none;',
'}',
'body[data-dsh-hakurei] [data-phase=\'hero\'] [data-composer-card]::after {',
'  background: transparent;',
'}',
'body[data-dsh-hakurei][data-ds-dark-theme] [data-phase=\'hero\'] [data-composer-card]::after {',
'  background: transparent;',
'}',
'body[data-dsh-hakurei] [data-composer-card] textarea {',
'  background: transparent;',
'  text-shadow: 0 1px 1px rgba(255, 250, 238, 0.8);',
'}',
'body[data-dsh-hakurei] [data-composer-card] textarea::placeholder {',
'  color: rgba(90, 58, 36, 0.75);',
'  text-shadow: 0 1px 1px rgba(255, 250, 238, 0.85);',
'}',
].join('\n')

fs.writeFileSync(dst, css)
console.log('wrote', dst, css.length, 'bytes')

const leftovers = (css.match(/maid/g) || []).length
console.log('leftover "maid" tokens:', leftovers)
const check = ['#526aa8', '#10204d', '#0a173b', '#172347', '#e2e8f5', '#dce6f5'].map((h) => h + ' -> ' + (css.includes(h) ? 'STILL PRESENT' : 'ok')).join('\n')
console.log(check)
console.log('sample remaps:', ['#172347', '#526aa8', '#0a173b', '#e2e8f5', '#9bb0e1', '#dce6f5'].map((h) => h + ' -> ' + remapHex(h)).join(', '))
