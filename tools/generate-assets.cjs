/**
 * touhou-hakurei asset generator.
 * Reads the user's prepared materials (processed-v2 webp set), rasterizes
 * programmatic Touhou-shrine chrome art (SVG -> webp via sharp), crops the
 * Reimu favicon, and emits the generated TS art modules consumed by the
 * client plugin source. Run: node tools/generate-assets.js
 */
'use strict'
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const ASSETS_DIR = 'C:/Users/1/Desktop/图片/processed-v2'
const RAW_DIR = 'C:/Users/1/Desktop/图片'
const OUT_SRC = path.join(ROOT, 'src', 'client')

let sharp = null
try {
  sharp = require('C:/Users/1/.dsh/profiles/web/node_modules/sharp')
} catch {
  sharp = require('sharp')
}

/* palette */
const VERMILION = '#c8442f'
const VERMILION_DEEP = '#a83420'
const GOLD = '#cfa334'
const MAROON_900 = '#3c1a12'
const MAROON_950 = '#2b1210'
const MAROON_800 = '#54241a'

async function svgToWebp(svg, width, height, outName, quality = 90) {
  const buf = await sharp(Buffer.from(svg), { density: 300 })
    .resize(width, height)
    .webp({ quality })
    .toBuffer()
  fs.writeFileSync(path.join(ROOT, 'assets-gen', outName), buf)
  return buf
}

/* 方框.png — the user's vertical banner frame (curtain header, vermilion
   rails, decorated foot band) wrapping the whole sidebar. PNG with alpha is
   converted to webp (alpha preserved) and embedded as a data URI. */
async function sidebarFrameWebp(outName, quality) {
  const png = fs.readFileSync(path.join(RAW_DIR, '方框.png'))
  const buf = await sharp(png).webp({ quality: quality || 78, alphaQuality: 82 }).toBuffer()
  fs.writeFileSync(path.join(ROOT, 'assets-gen', outName), buf)
  return buf
}

/* 对话框.png — the user's landscape dialog frame (paper curtain header,
   vermilion rails, decorated foot band) wrapping the composer. The source
   is embedded untouched (no cropping). Nine-slice layout (top 276 / right
   65 / bottom 84 / left 65 in the 2172x724 source) is consumed by the
   composer-frame CSS. */
async function composerFrameWebp(outName, quality) {
  const png = fs.readFileSync(path.join(RAW_DIR, '对话框.png'))
  const buf = await sharp(png).webp({ quality: quality || 76, alphaQuality: 86, effort: 6 }).toBuffer()
  fs.writeFileSync(path.join(ROOT, 'assets-gen', outName), buf)
  return buf
}

function b64(buf) { return buf.toString('base64') }

function tsModule(header, entries) {
  const lines = []
  lines.push('/**')
  for (const h of header) lines.push(' * ' + h)
  lines.push(' */')
  for (const [name, buf] of entries) {
    lines.push("export const " + name + " = 'data:image/webp;base64," + b64(buf) + "'")
    lines.push('')
  }
  return lines.join('\n')
}

/* ---------------- SVGs ---------------- */
function trimTopSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="149" viewBox="0 0 512 149">'
    + '<defs>'
    + '<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdf8ec"/><stop offset="1" stop-color="#f1e4cc"/></linearGradient>'
    + '<linearGradient id="fabric" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + MAROON_800 + '"/><stop offset="1" stop-color="' + MAROON_950 + '"/></linearGradient>'
    + '</defs>'
    + '<rect x="0" y="0" width="512" height="46" fill="url(#paper)"/>'
    + '<rect x="0" y="46" width="512" height="2.5" fill="' + VERMILION + '"/>'
    + '<rect x="0" y="48.5" width="512" height="1.2" fill="' + GOLD + '" opacity="0.9"/>'
    + '<rect x="0" y="50" width="512" height="99" fill="url(#fabric)"/>'
    + '<g opacity="0.5"><rect x="0" y="66" width="512" height="1" fill="' + GOLD + '"/><rect x="0" y="94" width="512" height="1" fill="' + GOLD + '" opacity="0.75"/><rect x="0" y="122" width="512" height="1" fill="' + GOLD + '" opacity="0.5"/></g>'
    + '<g fill="none" stroke="' + VERMILION + '" stroke-width="2.2" opacity="0.55">'
    + '<path d="M64 64 v-8 h128 v8" /><path d="M80 64 v-3 h96 v3" /><path d="M96 64 v34" /><path d="M160 64 v34" />'
    + '<path d="M320 64 v-8 h128 v8" /><path d="M336 64 v-3 h96 v3" /><path d="M352 64 v34" /><path d="M416 64 v34" />'
    + '</g></svg>'
}

function trimBottomSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="412" viewBox="0 0 720 412">'
    + '<defs>'
    + '<linearGradient id="fabric" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + MAROON_950 + '"/><stop offset="1" stop-color="' + MAROON_800 + '"/></linearGradient>'
    + '<linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e8d2"/><stop offset="1" stop-color="#fdf8ec"/></linearGradient>'
    + '</defs>'
    + '<rect x="0" y="0" width="720" height="300" fill="url(#fabric)"/>'
    + '<rect x="0" y="300" width="720" height="1.5" fill="' + GOLD + '" opacity="0.85"/>'
    + '<rect x="0" y="301.5" width="720" height="6" fill="' + VERMILION + '"/>'
    + '<rect x="0" y="307.5" width="720" height="104.5" fill="url(#paper)"/>'
    + '<g fill="' + VERMILION + '" opacity="0.5">'
    + '<rect x="12" y="340" width="14" height="72"/><rect x="88" y="340" width="14" height="72"/><rect x="4" y="330" width="106" height="8" rx="2"/><rect x="18" y="352" width="78" height="6" rx="2"/>'
    + '<rect x="372" y="340" width="14" height="72"/><rect x="448" y="340" width="14" height="72"/><rect x="364" y="330" width="106" height="8" rx="2"/><rect x="378" y="352" width="78" height="6" rx="2"/>'
    + '</g>'
    + '<g fill="none" stroke="' + GOLD + '" stroke-width="1.5" opacity="0.7"><circle cx="224" cy="375" r="10"/><circle cx="584" cy="375" r="10"/></g>'
    + '</svg>'
}

function crestSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="188" height="108" viewBox="0 0 188 108">'
    + '<g stroke-linejoin="round">'
    + '<path d="M14 26 Q94 -6 174 26 L174 38 Q94 4 14 38 Z" fill="' + VERMILION + '"/>'
    + '<path d="M24 44 L164 44 L164 52 L24 52 Z" fill="' + VERMILION_DEEP + '"/>'
    + '<rect x="52" y="52" width="14" height="52" fill="' + VERMILION_DEEP + '"/><rect x="122" y="52" width="14" height="52" fill="' + VERMILION_DEEP + '"/>'
    + '<rect x="50" y="52" width="18" height="6" fill="' + GOLD + '" opacity="0.9"/><rect x="120" y="52" width="18" height="6" fill="' + GOLD + '" opacity="0.9"/>'
    + '<path d="M30 32 Q94 0 158 32" fill="none" stroke="' + GOLD + '" stroke-width="2" opacity="0.85"/>'
    + '</g></svg>'
}

function bowSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="126" viewBox="0 0 240 126">'
    + '<defs><radialGradient id="sun" cx="0.42" cy="0.38" r="0.85"><stop offset="0" stop-color="#f06a4c"/><stop offset="0.55" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + VERMILION_DEEP + '"/></radialGradient></defs>'
    + '<circle cx="120" cy="63" r="34" fill="none" stroke="' + GOLD + '" stroke-width="3.5" opacity="0.95"/>'
    + '<circle cx="120" cy="63" r="29" fill="url(#sun)"/>'
    + '<path d="M104 48 Q120 40 136 48" fill="none" stroke="#ffd9c8" stroke-width="3" stroke-linecap="round" opacity="0.8"/>'
    + '</svg>'
}

function newSessionSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="310" viewBox="0 0 900 310">'
    + '<defs>'
    + '<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + MAROON_800 + '"/><stop offset="0.5" stop-color="' + MAROON_900 + '"/><stop offset="1" stop-color="' + MAROON_950 + '"/></linearGradient>'
    + '<linearGradient id="cap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + VERMILION_DEEP + '"/><stop offset="1" stop-color="' + MAROON_800 + '"/></linearGradient>'
    + '</defs>'
    + '<rect x="0" y="0" width="900" height="310" rx="34" fill="url(#plate)"/>'
    + '<rect x="1" y="1" width="898" height="308" rx="33" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0.9"/>'
    + '<rect x="8" y="8" width="884" height="294" rx="27" fill="none" stroke="' + GOLD + '" stroke-width="1.4" opacity="0.5"/>'
    + '<rect x="16" y="16" width="868" height="278" rx="20" fill="none" stroke="' + VERMILION + '" stroke-width="2" opacity="0.85"/>'
    + '<rect x="0" y="0" width="210" height="310" fill="url(#cap)" opacity="0.55"/>'
    + '<rect x="690" y="0" width="210" height="310" fill="url(#cap)" opacity="0.55" transform="scale(-1,1) translate(-900,0)"/>'
    + '<circle cx="105" cy="155" r="52" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.85"/>'
    + '<circle cx="795" cy="155" r="52" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.85"/>'
    + '</svg>'
}

function swagSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="964" height="302" viewBox="0 0 964 302">'
    + '<defs><linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + VERMILION_DEEP + '"/></linearGradient></defs>'
    + '<path d="M8 52 Q482 8 956 52 L956 74 Q482 32 8 74 Z" fill="url(#bar)"/>'
    + '<path d="M8 52 Q482 8 956 52" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.9"/>'
    + '<rect x="36" y="86" width="892" height="18" rx="9" fill="' + VERMILION_DEEP + '"/>'
    + '<rect x="36" y="86" width="892" height="18" rx="9" fill="none" stroke="' + GOLD + '" stroke-width="2" opacity="0.8"/>'
    + '<rect x="64" y="104" width="30" height="198" rx="6" fill="url(#bar)"/><rect x="870" y="104" width="30" height="198" rx="6" fill="url(#bar)"/>'
    + '<rect x="64" y="104" width="30" height="10" fill="' + GOLD + '" opacity="0.9"/><rect x="870" y="104" width="30" height="10" fill="' + GOLD + '" opacity="0.9"/>'
    + '<circle cx="482" cy="104" r="10" fill="' + GOLD + '" opacity="0.9"/>'
    + '</svg>'
}

function cornerSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1254 1254">'
    + '<defs>'
    + '<linearGradient id="barh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + GOLD + '"/><stop offset="0.5" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>'
    + '<linearGradient id="barv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + GOLD + '"/><stop offset="0.5" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + GOLD + '"/></linearGradient>'
    + '</defs>'
    + '<rect x="900" y="40" width="314" height="34" rx="6" fill="url(#barh)"/>'
    + '<rect x="1180" y="40" width="34" height="314" rx="6" fill="url(#barv)"/>'
    + '<rect x="900" y="40" width="314" height="34" rx="6" fill="none" stroke="#7a2414" stroke-width="3" opacity="0.5"/>'
    + '<rect x="1180" y="40" width="34" height="314" rx="6" fill="none" stroke="#7a2414" stroke-width="3" opacity="0.5"/>'
    + '<circle cx="1206" cy="74" r="9" fill="' + GOLD + '"/>'
    + '</svg>'
}

function composerFrameSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="588" viewBox="0 0 1800 588">'
    + '<defs>'
    + '<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(250,246,236,0.92)"/><stop offset="1" stop-color="rgba(240,230,210,0.78)"/></linearGradient>'
    + '<linearGradient id="topband" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + VERMILION_DEEP + '"/></linearGradient>'
    + '</defs>'
    + '<rect x="30" y="30" width="1740" height="528" rx="48" fill="url(#face)"/>'
    + '<rect x="30" y="30" width="1740" height="528" rx="48" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.85"/>'
    + '<rect x="30" y="30" width="1740" height="72" rx="48" fill="url(#topband)"/>'
    + '<rect x="30" y="86" width="1740" height="3" fill="' + GOLD + '" opacity="0.95"/>'
    + '<rect x="42" y="102" width="1716" height="1.5" fill="' + VERMILION + '" opacity="0.5"/>'
    + '<rect x="42" y="540" width="1716" height="2" fill="' + GOLD + '" opacity="0.7"/>'
    + '</svg>'
}

function settingsFrameSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="2172" height="320" viewBox="0 0 2172 320">'
    + '<defs>'
    + '<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + MAROON_800 + '"/><stop offset="0.5" stop-color="' + MAROON_900 + '"/><stop offset="1" stop-color="' + MAROON_950 + '"/></linearGradient>'
    + '<linearGradient id="cap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="' + VERMILION_DEEP + '"/><stop offset="1" stop-color="' + MAROON_800 + '"/></linearGradient>'
    + '</defs>'
    + '<rect x="0" y="0" width="2172" height="320" rx="36" fill="url(#plate)"/>'
    + '<rect x="1" y="1" width="2170" height="318" rx="35" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0.9"/>'
    + '<rect x="10" y="10" width="2152" height="300" rx="27" fill="none" stroke="' + VERMILION + '" stroke-width="2" opacity="0.8"/>'
    + '<rect x="0" y="0" width="220" height="320" fill="url(#cap)" opacity="0.5"/>'
    + '<rect x="1952" y="0" width="220" height="320" fill="url(#cap)" opacity="0.5" transform="scale(-1,1) translate(-2172,0)"/>'
    + '<circle cx="110" cy="160" r="52" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.85"/>'
    + '<circle cx="2062" cy="160" r="52" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.85"/>'
    + '</svg>'
}

function ribbonSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1185" height="240" viewBox="0 0 1185 240">'
    + '<defs><linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + VERMILION + '"/><stop offset="1" stop-color="' + VERMILION_DEEP + '"/></linearGradient></defs>'
    + '<rect x="145" y="14" width="895" height="212" rx="14" fill="url(#rib)"/>'
    + '<rect x="145" y="14" width="895" height="212" rx="14" fill="none" stroke="' + GOLD + '" stroke-width="4" opacity="0.9"/>'
    + '<rect x="153" y="24" width="879" height="192" rx="9" fill="none" stroke="' + GOLD + '" stroke-width="1.4" opacity="0.5"/>'
    + '<path d="M145 14 L52 34 L52 206 L145 226 Z" fill="' + MAROON_800 + '"/>'
    + '<path d="M145 14 L52 34 L52 206 L145 226 Z" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0.8"/>'
    + '<path d="M1040 14 L1140 30 L1185 58 L1185 182 L1140 210 L1040 226 Z" fill="' + MAROON_900 + '"/>'
    + '<path d="M1040 14 L1140 30 L1185 58 L1185 182 L1140 210 L1040 226 Z" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0.8"/>'
    + '</svg>'
}

function shieldSvg() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="230" height="320" viewBox="0 0 230 320">'
    + '<path d="M14 62 Q115 2 216 62 L216 84 Q115 28 14 84 Z" fill="' + VERMILION + '"/>'
    + '<path d="M14 62 Q115 2 216 62" fill="none" stroke="' + GOLD + '" stroke-width="6" opacity="0.95"/>'
    + '<rect x="30" y="96" width="170" height="20" rx="10" fill="' + VERMILION_DEEP + '"/>'
    + '<rect x="30" y="96" width="170" height="20" rx="10" fill="none" stroke="' + GOLD + '" stroke-width="3" opacity="0.8"/>'
    + '<rect x="60" y="116" width="22" height="180" rx="8" fill="' + VERMILION_DEEP + '"/><rect x="148" y="116" width="22" height="180" rx="8" fill="' + VERMILION_DEEP + '"/>'
    + '<rect x="60" y="116" width="22" height="12" fill="' + GOLD + '" opacity="0.95"/><rect x="148" y="116" width="22" height="12" fill="' + GOLD + '" opacity="0.95"/>'
    + '<circle cx="115" cy="88" r="9" fill="' + GOLD + '" opacity="0.95"/>'
    + '</svg>'
}

/* ---------------- main ---------------- */
async function main() {
  fs.mkdirSync(path.join(ROOT, 'assets-gen'), { recursive: true })
  fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true })

  const read = (name) => fs.readFileSync(path.join(ASSETS_DIR, name))
  for (const f of fs.readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.b64'))) {
    const webp = f.replace(/\.b64$/, '.webp')
    const raw = read(webp)
    const b64file = fs.readFileSync(path.join(ASSETS_DIR, f), 'utf8').trim()
    if (b64file !== raw.toString('base64')) console.log('WARN: ' + f + ' does not match ' + webp)
  }
  console.log('processed-v2 assets sanity check done')

  const bgLight = read('bg-light.webp')
  const bgDark = read('bg-dark.webp')
  const reimuStand = read('reimu-stand.webp')
  const reimuFly = read('reimu-fly.webp')
  const banner = read('banner.webp')
  const sidebarFrame = await sidebarFrameWebp('sidebar-frame.webp', 78)
  console.log('方框.png -> assets-gen/sidebar-frame.webp', sidebarFrame.length, 'bytes')
  const composerFrame = await composerFrameWebp('composer-frame.webp', 75)
  console.log('对话框.png -> assets-gen/composer-frame.webp', composerFrame.length, 'bytes')

  const { data, info } = await sharp(reimuStand).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 12) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  console.log('reimu-stand alpha bbox:', JSON.stringify({ minX, minY, maxX, maxY, w: info.width, h: info.height }))
  const bboxH = maxY - minY + 1
  const cropTop = minY + Math.round(bboxH * 0.02)
  const cropH = Math.round(bboxH * 0.42)
  const cropW = Math.min(info.width, Math.round(cropH * 1.34))
  const cropX = Math.max(0, minX + Math.round((maxX - minX + 1 - cropW) / 2))
  const iconPng = await sharp(reimuStand)
    .extract({ left: cropX, top: cropTop, width: cropW, height: cropH })
    .resize(131, 98, { fit: 'cover', position: 'attention' })
    .png()
    .toBuffer()
  fs.writeFileSync(path.join(ROOT, 'assets-gen', 'icon.png'), iconPng)

  const chrome = [
    ['top-trim-tile.webp', trimTopSvg(), 512, 149],
    ['bottom-trim-tile.webp', trimBottomSvg(), 720, 412],
    ['bottom-crest.webp', crestSvg(), 188, 108],
    ['bow-clean.webp', bowSvg(), 240, 126],
    ['new-session.webp', newSessionSvg(), 900, 310],
    ['sidebar-swag.webp', swagSvg(), 964, 302],
    ['sidebar-corner.webp', cornerSvg(), 1254, 1254],
    /* composer-frame now comes from 对话框.png (composerFrameWebp above) */
    ['settings-frame.webp', settingsFrameSvg(), 2172, 320],
    ['workspace-ribbon.webp', ribbonSvg(), 1185, 240],
    ['workspace-shield.webp', shieldSvg(), 230, 320],
  ]
  const chromeBufs = {}
  for (const [name, svg, w, h] of chrome) {
    chromeBufs[name] = await svgToWebp(svg, w, h, name)
  }
  console.log('chrome art rasterized')

  fs.writeFileSync(path.join(ROOT, 'preview', 'light.webp'), bgLight)
  fs.writeFileSync(path.join(ROOT, 'preview', 'dark.webp'), bgDark)

  const headerNote = 'Generated by tools/generate-assets.js from the local Touhou material set (C:\\Users\\1\\Desktop\\图片).'

  fs.writeFileSync(path.join(OUT_SRC, 'background-art.generated.ts'), tsModule(
    [headerNote, 'Shrine backdrops and Reimu character layers (亮/暗主题神社背景与灵梦角色层).'],
    [
      ['HAKUREI_PALACE_LIGHT', bgLight],
      ['HAKUREI_PALACE_DARK', bgDark],
      ['HAKUREI_CHAR_LEFT', reimuStand],
      ['HAKUREI_CHAR_RIGHT', reimuFly],
    ],
  ))

  fs.writeFileSync(path.join(OUT_SRC, 'chrome-art.generated.ts'), tsModule(
    [headerNote, 'Generated shrine chrome artwork (程序生成的鸟居/朱红装饰) + 方框.png sidebar frame (用户素材内嵌).'],
    [
      ['HAKUREI_BOTTOM_TRIM_TILE', chromeBufs['bottom-trim-tile.webp']],
      ['HAKUREI_BOTTOM_CREST', chromeBufs['bottom-crest.webp']],
      ['HAKUREI_SIDEBAR_CORNER', chromeBufs['sidebar-corner.webp']],
      ['HAKUREI_SIDEBAR_FRAME', sidebarFrame],
      ['HAKUREI_COMPOSER_FRAME', composerFrame],
      ['HAKUREI_SETTINGS_FRAME', chromeBufs['settings-frame.webp']],
    ],
  ))

  fs.writeFileSync(path.join(OUT_SRC, 'workspace-art.generated.ts'), tsModule(
    [headerNote, 'Workspace tree ornament (工作区树装饰).'],
    [
      ['HAKUREI_WORKSPACE_RIBBON', chromeBufs['workspace-ribbon.webp']],
      ['HAKUREI_WORKSPACE_SHIELD', chromeBufs['workspace-shield.webp']],
    ],
  ))

  const art = '/**\n * Generated sidebar and ornamental raster assets for the Hakurei Shrine skin.\n * ' + headerNote + '\n */\n'
    + "export const HAKUREI_CHIBI = 'data:image/webp;base64," + b64(reimuStand) + "'\n\n"
    + '/** Hinomaru sun-disc ornament for the landing top band (着陆页中央日轮). */\n'
    + "export const HAKUREI_BOW_CLEAN = 'data:image/webp;base64," + b64(chromeBufs['bow-clean.webp']) + "'\n\n"
    + '/** Shrine seal plate for the live new-session control (新会话朱印牌). */\n'
    + "export const HAKUREI_NEW_SESSION = 'data:image/webp;base64," + b64(chromeBufs['new-session.webp']) + "'\n\n"
    + '/** Torii arch ornament above the live Plan button (Plan 按钮上方鸟居). */\n'
    + "export const HAKUREI_SIDEBAR_SWAG = 'data:image/webp;base64," + b64(chromeBufs['sidebar-swag.webp']) + "'\n\n"
    + '/** Continuous vermilion/paper strip for the global top edge (顶部缘带). */\n'
    + "export const HAKUREI_TOP_TRIM_TILE = 'data:image/webp;base64," + b64(chromeBufs['top-trim-tile.webp']) + "'\n\n"
    + '/** Touhou banner from the local material set (横幅.png), hero decoration. */\n'
    + "export const HAKUREI_BANNER = 'data:image/webp;base64," + b64(banner) + "'\n\n"
    + '/** Reimu crop used as the skin favicon (灵梦头像 favicon). */\n'
    + "export const HAKUREI_ICON = 'data:image/png;base64," + iconPng.toString('base64') + "'\n"
  fs.writeFileSync(path.join(OUT_SRC, 'art.ts'), art)

  console.log('generated TS art modules written')
  console.log('done. outputs in assets-gen/ and src/client/')
}

main().catch((e) => { console.error(e); process.exit(1) })
