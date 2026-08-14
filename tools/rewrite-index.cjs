/**
 * Rewrite the maid-atelier client entry into the Hakurei Shrine entry:
 * renames, Touhou title, vermilion system chrome, hero banner layer.
 * Run: node tools/rewrite-index.cjs
 */
'use strict'
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const file = path.join(ROOT, 'src', 'client', 'index.ts')
let src = fs.readFileSync(file, 'utf8')

/* constant names */
src = src.split('MAID_ATELIER_').join('HAKUREI_')
src = src.split('HAKUREI_MAID_LEFT').join('HAKUREI_CHAR_LEFT')
src = src.split('HAKUREI_MAID_RIGHT').join('HAKUREI_CHAR_RIGHT')

/* ids / owner / module css */
src = src.split('maid-atelier').join('hakurei-shrine')
src = src.split('maid-atelier.module.css').join('hakurei.module.css')

/* generic rename */
src = src.split('maid').join('hakurei')
/* body attribute stays data-dsh-hakurei, not data-dsh-hakurei-atelier */
src = src.split('dshHakureiAtelier').join('dshHakurei')
src = src.split('data-dsh-hakurei-atelier').join('data-dsh-hakurei')

/* Touhou title */
src = src.replace(/const SKIN_TITLE = '[^']*'/, "const SKIN_TITLE = '博丽神社 · Touhou Project'")
/* vermilion system chrome (theme-color) */
src = src.replace(/const SKIN_SYSTEM_CHROME_COLOR = '[^']*'/, "const SKIN_SYSTEM_CHROME_COLOR = '#8a2318'")

/* banner import: add HAKUREI_BANNER to the art.ts import list */
src = src.replace(
  "  HAKUREI_NEW_SESSION,",
  "  HAKUREI_NEW_SESSION,\n  HAKUREI_BANNER,",
)

/* banner art variable: BACKDROP_PROPERTIES + body style */
src = src.replace(
  "  '--hakurei-workspace-ribbon-art',",
  "  '--hakurei-workspace-ribbon-art',\n  '--hakurei-banner-art',",
)
src = src.replace(
  "  body.style.setProperty('--hakurei-workspace-ribbon-art', `url(${HAKUREI_WORKSPACE_RIBBON})`)",
  "  body.style.setProperty('--hakurei-workspace-ribbon-art', `url(${HAKUREI_WORKSPACE_RIBBON})`)\n  body.style.setProperty('--hakurei-banner-art', `url(${HAKUREI_BANNER})`)",
)

/* hero banner element: mount it right after the character stage */
const anchor = "  body.prepend(characterStage)"
src = src.replace(
  anchor,
  anchor + "\n\n  const heroBanner = document.createElement('div')\n  heroBanner.dataset.skinChrome = 'hero-banner'\n  heroBanner.dataset.skinOwner = SKIN_OWNER\n  heroBanner.setAttribute('aria-hidden', 'true')\n  ownedNodes.add(heroBanner)\n  body.append(heroBanner)"
)

fs.writeFileSync(file, src)
console.log('wrote', file, src.length, 'bytes')
console.log('leftover maid tokens:', (src.match(/maid/gi) || []).length)
console.log('banner wiring:', src.includes('HAKUREI_BANNER') && src.includes('--hakurei-banner-art') && src.includes('hero-banner') ? 'ok' : 'MISSING')
