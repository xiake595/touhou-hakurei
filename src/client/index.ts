/**
 * Deep-sea hakurei atelier skin. The client entry keeps the bare two-character
 * background, collapsible sidebar artwork, and ornamental chrome as
 * independent layers. The sidebar keeps the product's native vector
 * wordmark; every skin-owned write is restored by the Cordis effect disposer.
 */
import type { Context } from '@deepseek-ai/cordis'
import {
  HAKUREI_BOW_CLEAN,
  HAKUREI_CHIBI,
  HAKUREI_ICON,
  HAKUREI_NEW_SESSION,
  HAKUREI_BANNER,
  HAKUREI_SIDEBAR_SWAG,
  HAKUREI_TOP_TRIM_TILE,
} from './art.ts'
import {
  HAKUREI_CHAR_LEFT,
  HAKUREI_CHAR_RIGHT,
  HAKUREI_PALACE_DARK,
  HAKUREI_PALACE_LIGHT,
} from './background-art.generated.ts'
import {
  HAKUREI_BOTTOM_CREST,
  HAKUREI_BOTTOM_TRIM_TILE,
  HAKUREI_COMPOSER_FRAME,
  HAKUREI_SETTINGS_FRAME,
  HAKUREI_SIDEBAR_CORNER,
  HAKUREI_SIDEBAR_FRAME,
} from './chrome-art.generated.ts'
import {
  HAKUREI_WORKSPACE_RIBBON,
  HAKUREI_WORKSPACE_SHIELD,
} from './workspace-art.generated.ts'
import './hakurei.module.css'
import { HAKUREI_TITLEBAR_BRAND } from './titlebar-brand.ts'

const SKIN_TITLE = '博丽神社 · Touhou Project'
const SKIN_OWNER = 'hakurei-shrine'
const SKIN_SYSTEM_CHROME_COLOR = '#8a2318'
const SIDEBAR_COLUMN_SELECTOR = ":is([data-pane='sidebar'], [class*='sidebarCol'])"
const SETTINGS_TRIGGER_SELECTOR = "[data-slot='sidebar.settings'] > :is(button, [role='button'])"
const SETTINGS_MASK_SELECTOR = "[role='presentation'] > [class*='mask']"

const BACKDROP_PROPERTIES = [
  'background-image',
  'background-position',
  'background-size',
  'background-attachment',
  'background-repeat',
  '--hakurei-sidebar-width',
  '--hakurei-top-trim-art',
  '--hakurei-bottom-trim-art',
  '--hakurei-bottom-crest-art',
  '--hakurei-bow-art',
  '--hakurei-new-session-art',
  '--hakurei-sidebar-swag-art',
  '--hakurei-sidebar-corner-art',
  '--hakurei-sidebar-frame-art',
  '--hakurei-composer-frame-art',
  '--hakurei-settings-frame-art',
  '--hakurei-workspace-crest-art',
  '--hakurei-workspace-ribbon-art',
  '--hakurei-banner-art',
] as const

function createCharacterStage(): HTMLDivElement {
  const stage = document.createElement('div')
  stage.dataset.skinChrome = 'character-stage'
  stage.dataset.skinOwner = SKIN_OWNER
  stage.setAttribute('aria-hidden', 'true')

  const left = document.createElement('img')
  left.dataset.hakureiCharacter = 'left'
  left.alt = ''
  left.src = HAKUREI_CHAR_LEFT

  const right = document.createElement('img')
  right.dataset.hakureiCharacter = 'right'
  right.alt = ''
  right.src = HAKUREI_CHAR_RIGHT

  stage.append(left, right)
  return stage
}

function createSidebarCorners(): HTMLDivElement {
  const corners = document.createElement('div')
  corners.dataset.skinChrome = 'sidebar-corners'
  corners.dataset.skinOwner = SKIN_OWNER
  corners.setAttribute('aria-hidden', 'true')
  for (const position of ['top-left', 'top-right', 'bottom-right', 'bottom-left']) {
    const corner = document.createElement('span')
    corner.dataset.skinCorner = position
    corners.append(corner)
  }
  return corners
}

/**
 * Place the whale-free DeepSeek Harness wordmark at the left of the
 * frameless title bar (Web-app overlay / desktop shell), mirroring the
 * sidebar brand at a smaller scale.
 */
function decorateTitlebarBrand(ownedNodes: Set<Element>): void {
  const titlebar = document.querySelector<HTMLElement>("[class*='titlebar']")
  if (!titlebar) return
  if (titlebar.querySelector("[data-skin-chrome='titlebar-brand']")) return
  const brand = document.createElement('span')
  brand.dataset.skinChrome = 'titlebar-brand'
  brand.dataset.skinOwner = SKIN_OWNER
  brand.setAttribute('aria-hidden', 'true')
  brand.innerHTML = HAKUREI_TITLEBAR_BRAND
  ownedNodes.add(brand)
  titlebar.prepend(brand)
}
function decorateSidebar(ownedNodes: Set<Element>, decoratedElements: Set<HTMLElement>): void {
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  const sidebarRoot = sidebar?.querySelector<HTMLElement>(':scope > div')
  if (!sidebar || !sidebarRoot) return

  sidebar.querySelectorAll<HTMLElement>('[data-hakurei-sidebar-footer]').forEach((element) => {
    delete element.dataset.hakureiSidebarFooter
  })
  const settingsSlot = sidebar.querySelector<HTMLElement>("[data-slot='sidebar.settings']")
  if (settingsSlot) {
    let footer = settingsSlot.parentElement
    while (footer && footer !== sidebar) {
      if (footer.querySelector("[data-slot='sidebar.footer.action']")) {
        footer.dataset.hakureiSidebarFooter = ''
        decoratedElements.add(footer)
        break
      }
      footer = footer.parentElement
    }
  }

  if (!sidebarRoot.querySelector("[data-skin-chrome='sidebar-corners']")) {
    const corners = createSidebarCorners()
    ownedNodes.add(corners)
    sidebarRoot.prepend(corners)
  }

  if (!sidebarRoot.querySelector("[data-skin-chrome='sidebar-mascot']")) {
    const mascot = document.createElement('img')
    mascot.dataset.skinChrome = 'sidebar-mascot'
    mascot.dataset.skinOwner = SKIN_OWNER
    mascot.setAttribute('aria-hidden', 'true')
    mascot.alt = ''
    mascot.src = HAKUREI_CHIBI
    ownedNodes.add(mascot)
    sidebarRoot.prepend(mascot)
  }

}

function decorateWorkspaceTree(decoratedElements: Set<HTMLElement>): void {
  const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  if (!sidebar) return

  sidebar.querySelectorAll<HTMLElement>(
    '[data-hakurei-workspace-group], [data-hakurei-workspace-row], [data-hakurei-workspace-active], [data-hakurei-session-row], [data-hakurei-session-flat], [data-hakurei-session-first], [data-hakurei-session-last]',
  ).forEach((element) => {
    delete element.dataset.hakureiWorkspaceGroup
    delete element.dataset.hakureiWorkspaceRow
    delete element.dataset.hakureiWorkspaceActive
    delete element.dataset.hakureiSessionRow
    delete element.dataset.hakureiSessionFlat
    delete element.dataset.hakureiSessionFirst
    delete element.dataset.hakureiSessionLast
  })

  sidebar.querySelectorAll<HTMLElement>("[role='tree']").forEach((tree) => {
    const rows = [...tree.querySelectorAll<HTMLElement>("[role='treeitem']")]
    if (tree.matches("[class*='flatList']") && !rows.some(row => row.hasAttribute('aria-expanded'))) {
      rows.filter(row => row.hasAttribute('aria-selected')).forEach((sessionRow) => {
        sessionRow.dataset.hakureiSessionRow = ''
        sessionRow.dataset.hakureiSessionFlat = ''
        decoratedElements.add(sessionRow)
      })
      return
    }

    let workspaceRow: HTMLElement | undefined
    let sessionRows: HTMLElement[] = []
    const decorateGroup = (): void => {
      if (!workspaceRow) return

      workspaceRow.dataset.hakureiWorkspaceRow = ''
      decoratedElements.add(workspaceRow)
      if (workspaceRow.parentElement) {
        workspaceRow.parentElement.dataset.hakureiWorkspaceGroup = ''
        decoratedElements.add(workspaceRow.parentElement)
      }
      sessionRows.forEach((sessionRow) => {
        sessionRow.dataset.hakureiSessionRow = ''
        decoratedElements.add(sessionRow)
      })
      if (sessionRows[0]) sessionRows[0].dataset.hakureiSessionFirst = ''
      if (sessionRows.at(-1)) sessionRows.at(-1)!.dataset.hakureiSessionLast = ''

      const containsCurrent = workspaceRow.getAttribute('aria-expanded') === 'true'
        && sessionRows.some(sessionRow => sessionRow.getAttribute('aria-selected') === 'true')
      if (containsCurrent) workspaceRow.dataset.hakureiWorkspaceActive = ''
    }

    rows.forEach((row) => {
      if (row.hasAttribute('aria-expanded')) {
        decorateGroup()
        workspaceRow = row
        sessionRows = []
      } else if (workspaceRow && row.hasAttribute('aria-selected')) {
        sessionRows.push(row)
      }
    })
    decorateGroup()
  })
}

/**
 * Apply the skin-owned background and independently retractable chrome.
 * @param ctx - owning context whose effect retracts every DOM and CSS write.
 */
export function apply(ctx: Context): void {
  const body = document.body
  const originalTitle = document.title
  const previous = new Map<string, string>()
  for (const property of BACKDROP_PROPERTIES) {
    previous.set(property, body.style.getPropertyValue(property))
  }

  const ownedNodes = new Set<Element>()
  const decoratedElements = new Set<HTMLElement>()
  let themeColorMeta: HTMLMetaElement | null = null
  let previousThemeColor: string | undefined
  let themeColorObserver: MutationObserver | undefined
  let observedSidebar: HTMLElement | undefined
  let resizeObserver: ResizeObserver | undefined
  let composerPhase: 'hero' | 'active' | undefined
  let composerMotionTimer: ReturnType<typeof setTimeout> | undefined
  let settingsBackdropFrame: HTMLDivElement | undefined
  let observer: MutationObserver | undefined
  let titlebarOverlay: WindowControlsOverlay | undefined
  let syncTitlebarHeight: (() => void) | undefined

  ctx.effect(() => () => {
    delete body.dataset.dshHakurei
    delete body.dataset.hakureiComposerMotion
    delete body.dataset.hakureiSidebarCompact
    delete body.dataset.hakureiSidebarSize
    if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
    observer?.disconnect()
    themeColorObserver?.disconnect()
    if (titlebarOverlay !== undefined && syncTitlebarHeight !== undefined) {
      titlebarOverlay.removeEventListener('geometrychange', syncTitlebarHeight)
    }
    resizeObserver?.disconnect()
    for (const [property, value] of previous) {
      body.style.setProperty(property, value)
    }
    ownedNodes.forEach(element => element.remove())
    decoratedElements.forEach((element) => {
      delete element.dataset.hakureiSidebarFooter
      delete element.dataset.hakureiWorkspaceGroup
      delete element.dataset.hakureiWorkspaceRow
      delete element.dataset.hakureiWorkspaceActive
      delete element.dataset.hakureiSessionRow
      delete element.dataset.hakureiSessionFlat
      delete element.dataset.hakureiSessionFirst
      delete element.dataset.hakureiSessionLast
    })
    if (themeColorMeta?.isConnected && themeColorMeta.content === SKIN_SYSTEM_CHROME_COLOR) {
      themeColorMeta.content = previousThemeColor ?? ''
    }
    if (document.title === SKIN_TITLE) document.title = originalTitle
  }, 'ui-skin-hakurei-shrine: layered background and ornament')

  const syncSystemChrome = (): void => {
    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta === null) return
    if (meta !== themeColorMeta) {
      themeColorMeta = meta
      previousThemeColor = meta.content
    }
    if (meta.content !== SKIN_SYSTEM_CHROME_COLOR) meta.content = SKIN_SYSTEM_CHROME_COLOR
  }
  themeColorObserver = new MutationObserver(syncSystemChrome)
  themeColorObserver.observe(document.head, {
    attributes: true,
    attributeFilter: ['content'],
    childList: true,
    subtree: true,
  })
  syncSystemChrome()
  body.dataset.dshHakurei = ''
  body.style.setProperty('--hakurei-top-trim-art', `url(${HAKUREI_TOP_TRIM_TILE})`)
  body.style.setProperty('--hakurei-bottom-trim-art', `url(${HAKUREI_BOTTOM_TRIM_TILE})`)
  body.style.setProperty('--hakurei-bottom-crest-art', `url(${HAKUREI_BOTTOM_CREST})`)
  body.style.setProperty('--hakurei-bow-art', `url(${HAKUREI_BOW_CLEAN})`)
  body.style.setProperty('--hakurei-new-session-art', `url(${HAKUREI_NEW_SESSION})`)
  body.style.setProperty('--hakurei-sidebar-swag-art', `url(${HAKUREI_SIDEBAR_SWAG})`)
  body.style.setProperty('--hakurei-sidebar-corner-art', `url(${HAKUREI_SIDEBAR_CORNER})`)
  body.style.setProperty('--hakurei-sidebar-frame-art', `url(${HAKUREI_SIDEBAR_FRAME})`)
  body.style.setProperty('--hakurei-composer-frame-art', `url(${HAKUREI_COMPOSER_FRAME})`)
  body.style.setProperty('--hakurei-settings-frame-art', `url(${HAKUREI_SETTINGS_FRAME})`)
  body.style.setProperty('--hakurei-workspace-crest-art', `url(${HAKUREI_WORKSPACE_SHIELD})`)
  body.style.setProperty('--hakurei-workspace-ribbon-art', `url(${HAKUREI_WORKSPACE_RIBBON})`)
  body.style.setProperty('--hakurei-banner-art', `url(${HAKUREI_BANNER})`)

  const syncBackdrop = (): void => {
    const source = body.hasAttribute('data-ds-dark-theme')
      ? HAKUREI_PALACE_DARK
      : HAKUREI_PALACE_LIGHT
    body.style.setProperty('background-image', `url(${source})`)
  }
  syncBackdrop()
  body.style.setProperty('background-position', 'center top')
  body.style.setProperty('background-size', 'cover')
  body.style.setProperty('background-attachment', 'fixed')
  body.style.setProperty('background-repeat', 'no-repeat')

  // 宽度联动写入独立的 <style> 规则而非 body style：CSSOM 修改不产生
  // attribute mutation，Chrome autofill 的 MutationObserver 不会逐帧触发，
  // 因此可以每帧跟随侧边栏宽度（幕布瞬移跟手）而无需防抖节流。
  const widthSheet = document.createElement('style')
  widthSheet.dataset.skinChrome = 'sidebar-width-rule'
  widthSheet.dataset.skinOwner = SKIN_OWNER
  ownedNodes.add(widthSheet)
  document.head.append(widthSheet)
  widthSheet.sheet!.insertRule('body { --hakurei-sidebar-width: 280px; --hakurei-sidebar-swag-height: 72.1px; --hakurei-sidebar-mascot-width: 229.6px; --hakurei-titlebar-height: 0px; }')
  // The official frame rules reference env(titlebar-area-height), but the
  // CSS-modules pipeline rewrites the env() identifier there too, so the
  // title-bar row silently falls back to an auto row: expanding the sidebar
  // is fine, but collapsing it lets the content row’s max-content grow and
  // stretches the title-bar row to hundreds of pixels. Re-assert the rows
  // here through CSSOM, where env() survives verbatim (fallback 40px keeps
  // the headless/plain-tab mock sane), and pin the drag handles to the same
  // boundary.
  // insertRule defaults to index 0, which would push the body rule aside and
  // orphan the widthRule reference; append explicitly so cssRules[0] stays
  // the body variable rule.
  const appendRule = (rule: string): void => {
    widthSheet.sheet!.insertRule(rule, widthSheet.sheet!.cssRules.length)
  }
  appendRule('body[data-dsh-hakurei-shrine] [class*=\"frame\"][data-wco] { grid-template-rows: env(titlebar-area-height, 40px) 1fr; }')
  appendRule('body[data-dsh-hakurei-shrine] [class*=\"frame\"][data-desktop] { grid-template-rows: 32px 1fr; }')
  appendRule('body[data-dsh-hakurei-shrine] [class*=\"frame\"] [class*=\"handle\"] { top: var(--hakurei-titlebar-height, 0px); }')

  const widthRule = widthSheet.sheet!.cssRules[0] as CSSStyleRule
  // The curtain is position:fixed, so it needs the viewport-space top of
  // the frame's title-bar row. Measuring the sidebar column (the row below
  // it) is authoritative: whatever the title-bar height is — WCO env(), the
  // desktop 32px row, or a scaled window — the curtain lands exactly on the
  // rendered boundary, never a pixel off.
  syncTitlebarHeight = (): void => {
    const columns = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (columns !== null) {
      const top = columns.getBoundingClientRect().top
      if (top > 0) {
        widthRule.style.setProperty('--hakurei-titlebar-height', `${top}px`)
        return
      }
    }
    // Desktop shell: fixed 32px row (columns not laid out yet).
    if (document.querySelector("[class*='frame'][data-desktop]") !== null) {
      widthRule.style.setProperty('--hakurei-titlebar-height', '32px')
      return
    }
    widthRule.style.setProperty('--hakurei-titlebar-height', '0px')
  }
  titlebarOverlay = navigator.windowControlsOverlay
  titlebarOverlay?.addEventListener('geometrychange', syncTitlebarHeight)
  syncTitlebarHeight()

  const applySidebarWidth = (width: number): void => {
    if (width <= 0) return
    const roundPx = (value: number): string => `${Math.round(value * 100) / 100}px`
    widthRule.style.setProperty('--hakurei-sidebar-width', roundPx(width))
    widthRule.style.setProperty('--hakurei-sidebar-swag-height', roundPx(Math.min(94, Math.max(54, width * 0.2575))))
    widthRule.style.setProperty('--hakurei-sidebar-mascot-width', roundPx(Math.min(320, width * 0.82)))
    body.dataset.hakureiSidebarSize = width <= 120 ? 'rail' : width <= 220 ? 'narrow' : 'wide'
    if (width <= 104) body.dataset.hakureiSidebarCompact = ''
    else delete body.dataset.hakureiSidebarCompact
  }

  const clearSidebarWidth = (): void => {
    widthRule.style.setProperty('--hakurei-sidebar-width', '0px')
    widthRule.style.setProperty('--hakurei-sidebar-swag-height', '54px')
    widthRule.style.setProperty('--hakurei-sidebar-mascot-width', '0px')
    body.dataset.hakureiSidebarSize = 'rail'
    body.dataset.hakureiSidebarCompact = ''
  }

  const ensureSidebarObserved = (): void => {
    const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (!resizeObserver || sidebar === observedSidebar) return
    if (!sidebar) {
      if (observedSidebar) resizeObserver.unobserve(observedSidebar)
      observedSidebar = undefined
      return
    }
    if (observedSidebar) resizeObserver.unobserve(observedSidebar)
    observedSidebar = sidebar
    resizeObserver.observe(sidebar)
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries.at(-1)
      if (entry) applySidebarWidth(entry.contentRect.width)
    })
  }

  const syncComposerMotion = (): void => {
    const phaseRoot = document.querySelector<HTMLElement>("[data-phase='hero'], [data-phase='active']")
    const next = phaseRoot?.dataset.phase
    if (next !== 'hero' && next !== 'active') return

    if (composerPhase !== undefined && composerPhase !== next) {
      body.dataset.hakureiComposerMotion = next === 'active' ? 'dock' : 'rise'
      if (composerMotionTimer !== undefined) clearTimeout(composerMotionTimer)
      composerMotionTimer = setTimeout(() => {
        delete body.dataset.hakureiComposerMotion
        composerMotionTimer = undefined
      }, 560)
    }
    composerPhase = next
  }

  /* The settings mask is mounted inside a promoted sidebar descendant. Chrome
     can omit sibling composited layers from that backdrop sample, so seat a
     copy of the existing frame immediately before the mask while it is open. */
  const syncSettingsBackdropFrame = (): void => {
    const expanded = document.querySelector(
      `${SETTINGS_TRIGGER_SELECTOR}[aria-expanded='true']`,
    )
    const mask = expanded === null
      ? null
      : document.querySelector<HTMLElement>(SETTINGS_MASK_SELECTOR)
    const overlay = mask?.parentElement
    if (overlay === undefined || overlay === null) {
      settingsBackdropFrame?.remove()
      return
    }

    if (settingsBackdropFrame === undefined) {
      settingsBackdropFrame = createSidebarCorners()
      settingsBackdropFrame.dataset.hakureiSettingsBackdropFrame = ''
      ownedNodes.add(settingsBackdropFrame)
    }
    if (settingsBackdropFrame.parentElement !== overlay) {
      overlay.insertBefore(settingsBackdropFrame, mask)
    }
  }

  decorateTitlebarBrand(ownedNodes)
  decorateSidebar(ownedNodes, decoratedElements)
  decorateWorkspaceTree(decoratedElements)
  ensureSidebarObserved()
  const initialSidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
  if (initialSidebar) applySidebarWidth(initialSidebar.getBoundingClientRect().width)
  syncComposerMotion()
  syncSettingsBackdropFrame()

  const characterStage = createCharacterStage()
  ownedNodes.add(characterStage)
  body.prepend(characterStage)

  const heroBanner = document.createElement('div')
  heroBanner.dataset.skinChrome = 'hero-banner'
  heroBanner.dataset.skinOwner = SKIN_OWNER
  heroBanner.setAttribute('aria-hidden', 'true')
  ownedNodes.add(heroBanner)
  body.append(heroBanner)

  const syncSidebarDecorations = (): void => {
    syncTitlebarHeight?.()
    decorateTitlebarBrand(ownedNodes)
    decorateSidebar(ownedNodes, decoratedElements)
    decorateWorkspaceTree(decoratedElements)
    ensureSidebarObserved()
    const sidebar = document.querySelector<HTMLElement>(SIDEBAR_COLUMN_SELECTOR)
    if (sidebar === null) clearSidebarWidth()
    else if (resizeObserver === undefined) applySidebarWidth(sidebar.getBoundingClientRect().width)
  }

  const isSkinChrome = (node: Node): boolean => (
    node instanceof Element && node.getAttribute('data-skin-owner') === SKIN_OWNER
  )

  const nodeTouches = (node: Node, selector: string): boolean => (
    node instanceof Element && (node.matches(selector) || node.querySelector(selector) !== null)
  )
  const sidebarChromeSelector = `${SIDEBAR_COLUMN_SELECTOR}, [class*='titlebar']`
  const composerSelector = "[data-phase='hero'], [data-phase='active']"

  // ResizeObserver writes the animated width through CSSOM, so it never enters
  // this observer. Keep structural decoration in the MutationObserver checkpoint
  // before paint: delaying every change made the wide/rail hand-off visibly late.
  // Skin-owned insertions are ignored so decorating a React-owned node cannot
  // schedule a redundant whole-sidebar pass.
  observer = new MutationObserver((records) => {
    let sidebarStructureChanged = false
    let workspaceStateChanged = false
    let backdropChanged = false
    let composerChanged = false
    let settingsStateChanged = false
    for (const record of records) {
      if (record.type === 'attributes') {
        const target = record.target instanceof Element ? record.target : undefined
        if (record.attributeName === 'aria-expanded'
          && target !== undefined
          && target.closest("[data-slot='sidebar.settings']") !== null) {
          settingsStateChanged = true
        } else if ((record.attributeName === 'aria-expanded' || record.attributeName === 'aria-selected')
          && target !== undefined && target.closest(SIDEBAR_COLUMN_SELECTOR) !== null) {
          workspaceStateChanged = true
        } else if (record.attributeName === 'data-ds-dark-theme' && record.target === body) {
          backdropChanged = true
        } else if (record.attributeName === 'data-phase' && target?.matches(composerSelector)) {
          composerChanged = true
        }
        continue
      }
      const appNodes = [...record.addedNodes, ...record.removedNodes]
        .filter(node => node instanceof Element && !isSkinChrome(node))
      const target = record.target instanceof Element ? record.target : undefined
      if (appNodes.length > 0 && (appNodes.some(node => nodeTouches(node, sidebarChromeSelector))
        || (target !== undefined && target.closest(SIDEBAR_COLUMN_SELECTOR) !== null))) {
        sidebarStructureChanged = true
      }
      if (appNodes.length > 0 && (appNodes.some(node => nodeTouches(node, composerSelector))
        || (target !== undefined && target.closest(composerSelector) !== null))) {
        composerChanged = true
      }
      if (appNodes.some(node => nodeTouches(node, SETTINGS_MASK_SELECTOR))) {
        settingsStateChanged = true
      }
    }
    if (sidebarStructureChanged) syncSidebarDecorations()
    else if (workspaceStateChanged) decorateWorkspaceTree(decoratedElements)
    if (backdropChanged) syncBackdrop()
    if (composerChanged) syncComposerMotion()
    if (settingsStateChanged) syncSettingsBackdropFrame()
  })
  observer.observe(body, {
    attributes: true,
    attributeFilter: ['aria-expanded', 'aria-selected', 'data-ds-dark-theme', 'data-phase'],
    childList: true,
    subtree: true,
  })

  const topTrim = document.createElement('div')
  topTrim.dataset.skinChrome = 'top-trim'
  topTrim.dataset.skinOwner = SKIN_OWNER
  topTrim.setAttribute('aria-hidden', 'true')
  const landingTrimLayer = document.createElement('div')
  landingTrimLayer.dataset.skinTrimLayer = 'landing'
  const workspaceTrimLayer = document.createElement('div')
  workspaceTrimLayer.dataset.skinTrimLayer = 'workspace'
  topTrim.append(landingTrimLayer, workspaceTrimLayer)
  ownedNodes.add(topTrim)
  body.append(topTrim)

  const bottomTrim = document.createElement('div')
  bottomTrim.dataset.skinChrome = 'bottom-trim'
  bottomTrim.dataset.skinOwner = SKIN_OWNER
  bottomTrim.setAttribute('aria-hidden', 'true')
  ownedNodes.add(bottomTrim)
  body.append(bottomTrim)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/png'
  favicon.href = HAKUREI_ICON
  favicon.dataset.skinChrome = 'favicon'
  favicon.dataset.skinOwner = SKIN_OWNER
  ownedNodes.add(favicon)
  document.head.append(favicon)

  document.title = SKIN_TITLE
}
