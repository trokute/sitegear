import { reactive, ref, watch } from 'vue'
import { bounds } from './geom'
import { googleSet, googleUrl } from './fonts'

const defaultFont = { name: 'Patrick Hand', link: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap' }
const vw = ref(window.innerWidth)

window.addEventListener('resize', () => {
  vw.value = window.innerWidth
})

let n = 0
let pn = 0
let gn = 0

const defAnim = () => ({ name: '', dur: 1, on: 'loop' })

function newPage(w = 1280, h = 900, bg = '#ffffff') {
  return { id: ++pn, w, h, bg, items: [], groups: {} }
}

export const state = reactive({
  pages: [newPage()],
  page: 0,
  sel: null,
  multi: [],
  menu: null,
  marq: null,
  draft: null,
  pen: { color: '#000000', width: 4 },
  tool: 'select',
  backdrop: '#ffffff',
  fonts: [defaultFont],
  guides: [],
  play: null,
  rec: null,
  kf: null,
  coding: false,
  script: null,
  sounds: [],
  audio: { bg: '', vol: 100 },
  get items() {
    return this.pages[this.page].items
  },
  set items(v) {
    this.pages[this.page].items = v
  },
  get bg() {
    return this.pages[this.page].bg
  },
  set bg(v) {
    this.pages[this.page].bg = v
  },
  get width() {
    return this.pages[this.page].w
  },
  set width(v) {
    this.pages[this.page].w = v
  },
  get height() {
    return this.pages[this.page].h
  },
  set height(v) {
    this.pages[this.page].h = v
  },
  get zoom() {
    return Math.max(0.1, Math.min(1, (vw.value - 80) / this.width))
  }
})

export function selected() {
  return state.items.find(i => i.id === state.sel)
}

export function gbox(gid, pg) {
  const bs = (pg || state.pages[state.page]).items.filter(i => i.gid === gid).map(i => bounds(i))
  const x = Math.min(...bs.map(b => b.l))
  const y = Math.min(...bs.map(b => b.t))
  return { x, y, w: Math.max(...bs.map(b => b.r)) - x, h: Math.max(...bs.map(b => b.b)) - y, r: 0 }
}

export function setFrame(gid, v) {
  const a = state.pages[state.page].groups[gid]
  const ob = a.box
  const nb = { ...ob, ...v }
  nb.w = Math.max(1, nb.w)
  nb.h = Math.max(1, nb.h)
  const oa = ob.r * Math.PI / 180
  const na = nb.r * Math.PI / 180
  const ox = ob.x + ob.w / 2
  const oy = ob.y + ob.h / 2
  const nx = nb.x + nb.w / 2
  const ny = nb.y + nb.h / 2
  state.items.forEach(m => {
    if (m.gid !== gid) return
    const dx = m.x + m.w / 2 - ox
    const dy = m.y + m.h / 2 - oy
    const u = (dx * Math.cos(oa) + dy * Math.sin(oa)) / ob.w * nb.w
    const w = (-dx * Math.sin(oa) + dy * Math.cos(oa)) / ob.h * nb.h
    m.w *= nb.w / ob.w
    m.h *= nb.h / ob.h
    m.r += nb.r - ob.r
    m.x = nx + u * Math.cos(na) - w * Math.sin(na) - m.w / 2
    m.y = ny + u * Math.sin(na) + w * Math.cos(na) - m.h / 2
  })
  a.box = nb
}

export function gitem(gid, pg) {
  const a = (pg || state.pages[state.page]).groups[gid]
  const o = { id: 'g' + gid, gid, grp: true, anim: a, put: v => setFrame(gid, v) }
  for (const k of ['x', 'y', 'w', 'h', 'r']) {
    Object.defineProperty(o, k, { get: () => Math.round(a.box[k] * 10) / 10, set: v => setFrame(gid, { [k]: v }) })
  }
  for (const k of ['free', 'keys', 'cls']) {
    Object.defineProperty(o, k, { get: () => a[k], set: v => { a[k] = v } })
  }
  Object.defineProperty(o, 'opacity', { get: () => a.op ?? 100, set: v => { a.op = v } })
  return o
}

export function target(id) {
  return typeof id === 'string' ? gitem(Number(id.slice(1))) : state.items.find(i => i.id === id)
}

export function animTarget() {
  const s = selected()
  if (s && !s.gid) return s
  const m = s ? [s] : state.items.filter(i => state.multi.includes(i.id))
  const g = m.length ? m[0].gid : 0
  const ok = g && m.every(i => i.gid === g) && (s || m.length === state.items.filter(i => i.gid === g).length)
  return ok ? gitem(g) : null
}

export function addText() {
  const it = reactive({ id: ++n, type: 'text', text: 'Text', x: 80, y: 80, w: 240, h: 80, r: 0, link: '', opacity: 100, anim: defAnim(), color: '#000000', font: 'Patrick Hand', size: 32, lh: 1.2 })
  state.items.push(it)
  state.sel = it.id
}

export function selIds() {
  if (state.multi.length) return state.multi
  return state.sel === null ? [] : [state.sel]
}

export function pick(ids) {
  const one = ids.length === 1 ? state.items.find(i => i.id === ids[0]) : null
  if (one && !one.gid) {
    state.sel = one.id
    return
  }
  state.sel = null
  state.multi = ids
}

export function select(id, add) {
  const it = state.items.find(i => i.id === id)
  const grp = it.gid ? state.items.filter(i => i.gid === it.gid).map(i => i.id) : [id]
  const cur = selIds()
  if (add) pick(cur.includes(id) ? cur.filter(i => !grp.includes(i)) : [...new Set([...cur, ...grp])])
  else if (!cur.includes(id)) pick(grp)
}

export function clearSel() {
  state.sel = null
  state.multi = []
}

export function group() {
  const ids = selIds()
  if (ids.length < 2) return
  gn++
  const mem = state.items.filter(i => ids.includes(i.id))
  const last = state.items.reduce((m, i, k) => ids.includes(i.id) ? k : m, 0)
  const at = state.items.slice(0, last).filter(i => !ids.includes(i.id)).length
  const rest = state.items.filter(i => !ids.includes(i.id))
  mem.forEach(i => {
    i.gid = gn
  })
  rest.splice(at, 0, ...mem)
  state.items = rest
  state.pages[state.page].groups[gn] = { ...defAnim(), box: gbox(gn) }
  pick(ids)
}

export function ungroup() {
  const ids = selIds()
  const gs = state.items.filter(i => ids.includes(i.id) && i.gid).map(i => i.gid)
  state.items.forEach(i => {
    if (gs.includes(i.gid)) i.gid = 0
  })
  gs.forEach(g => {
    delete state.pages[state.page].groups[g]
  })
  pick(ids)
}

export function addStroke(pts, color, sw) {
  const pad = sw / 2 + 1
  const xs = pts.map(p => p[0])
  const ys = pts.map(p => p[1])
  const x = Math.min(...xs) - pad
  const y = Math.min(...ys) - pad
  const w = Math.max(...xs) - x + pad
  const h = Math.max(...ys) - y + pad
  const rel = pts.map(p => [Math.round((p[0] - x) * 10) / 10, Math.round((p[1] - y) * 10) / 10])
  const it = reactive({ id: ++n, type: 'stroke', x, y, w, h, ow: w, oh: h, r: 0, link: '', opacity: 100, anim: defAnim(), color, sw, pts: rel, gid: 0 })
  state.items.push(it)
}

export function addShape(type, x, y, w, h) {
  const it = reactive({ id: ++n, type, x, y, w, h, r: 0, link: '', opacity: 100, anim: defAnim(), color: '#cccccc', radius: 0 })
  state.items.push(it)
  state.sel = it.id
  return it
}

export function addImage(src, x = 120, y = 120) {
  if (!src) return
  const it = reactive({ id: ++n, type: 'image', src, x, y, w: 200, h: 200, r: 0, link: '', opacity: 100, anim: defAnim() })
  const img = new Image()
  img.onload = () => {
    if (!img.naturalWidth) return
    const k = Math.min(1, 400 / img.naturalWidth)
    it.w = Math.round(img.naturalWidth * k)
    it.h = Math.round(img.naturalHeight * k)
  }
  img.src = src
  state.items.push(it)
  state.sel = it.id
}

export function remove() {
  const ids = selIds()
  state.items = state.items.filter(i => !ids.includes(i.id))
  clearSel()
}

let clip = null

function pack() {
  const ids = selIds()
  const items = state.items.filter(i => ids.includes(i.id))
  if (!items.length) return null
  const groups = {}
  items.forEach(i => {
    if (i.gid) groups[i.gid] = state.pages[state.page].groups[i.gid]
  })
  return JSON.parse(JSON.stringify({ items, groups }))
}

function place(c) {
  if (!c) return
  c.items.forEach(i => {
    i.x += 20
    i.y += 20
  })
  Object.values(c.groups).forEach(g => {
    g.box.x += 20
    g.box.y += 20
  })
  const d = JSON.parse(JSON.stringify(c))
  const map = {}
  Object.keys(d.groups).forEach(k => {
    map[k] = ++gn
    state.pages[state.page].groups[gn] = d.groups[k]
  })
  const items = d.items.map(i => reactive({ ...i, id: ++n, gid: i.gid ? map[i.gid] : 0 }))
  state.items.push(...items)
  pick(items.map(i => i.id))
}

export function copy() {
  clip = pack() || clip
}

export function cut() {
  const c = pack()
  if (!c) return
  clip = c
  remove()
}

export function paste() {
  place(clip)
}

export function duplicate() {
  place(pack())
}

export function align(k) {
  const it = selected()
  if (!it) return
  const b = bounds(it)
  const w = state.width
  const h = state.height
  if (k === 'left') it.x = b.w / 2 - it.w / 2
  else if (k === 'center') it.x = w / 2 - it.w / 2
  else if (k === 'right') it.x = w - b.w / 2 - it.w / 2
  else if (k === 'top') it.y = b.h / 2 - it.h / 2
  else if (k === 'middle') it.y = h / 2 - it.h / 2
  else if (k === 'bottom') it.y = h - b.h / 2 - it.h / 2
}

export function addPage() {
  const c = state.pages[state.page]
  state.pages.push(newPage(c.w, c.h, c.bg))
  state.page = state.pages.length - 1
  state.sel = null
}

export function deletePage() {
  if (state.pages.length < 2) return
  const id = state.pages[state.page].id
  state.pages.splice(state.page, 1)
  state.pages.forEach(p => p.items.forEach(it => {
    if (it.link === id) it.link = ''
  }))
  state.page = Math.min(state.page, state.pages.length - 1)
  state.sel = null
}

watch(() => state.sel, v => {
  if (v !== null) state.multi = []
}, { flush: 'sync' })

watch(() => state.page, () => {
  state.multi = []
})

export function go(d) {
  const i = state.page + d
  if (i < 0 || i >= state.pages.length) return
  state.page = i
  state.sel = null
}

export function copyPage(i) {
  const src = state.pages[i]
  if (!src || i === state.page) return
  const c = state.pages[state.page]
  c.w = src.w
  c.h = src.h
  c.bg = src.bg
  c.items = JSON.parse(JSON.stringify(src.items)).map(it => ({ ...it, id: ++n }))
  c.groups = JSON.parse(JSON.stringify(src.groups || {}))
  state.sel = null
}

export function loadFont(f) {
  if (document.querySelector('link[href="' + f.link + '"]')) return
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = f.link
  document.head.appendChild(el)
}

export function addFont(input) {
  const url = ((input || '').match(/https?:\/\/[^"'\s<>)]+/) || [])[0]
  if (!url) return
  const clean = url.replace(/&amp;/g, '&')
  const m = clean.match(/family=([^:&]+)/)
  if (!m) return
  const name = decodeURIComponent(m[1].replace(/\+/g, ' '))
  if (state.fonts.find(f => f.name === name)) return
  const f = { name, link: clean }
  state.fonts.push(f)
  loadFont(f)
  const it = selected()
  if (it && it.type === 'text') it.font = name
}

export function load(d) {
  let pages = d.pages
  if (!Array.isArray(pages)) pages = [{ w: 1280, h: d.height || 900, bg: d.bg || '#ffffff', items: d.items }]
  pages.forEach((p, i) => {
    if (!p.id) p.id = i + 1
    if (!p.groups) p.groups = {}
    p.items.forEach(it => {
      if (it.link === undefined) it.link = ''
      if (!it.anim) it.anim = defAnim()
      if (it.opacity === undefined) it.opacity = 100
      if (it.gid === undefined) it.gid = 0
      if (it.gid && !p.groups[it.gid]) p.groups[it.gid] = defAnim()
    })
    Object.keys(p.groups).forEach(g => {
      if (!p.items.some(i => i.gid === Number(g))) delete p.groups[g]
      else if (!p.groups[g].box) p.groups[g].box = gbox(Number(g), p)
    })
  })
  state.pages = pages
  state.page = 0
  state.backdrop = d.backdrop || '#ffffff'
  state.coding = false
  state.script = d.script || null
  state.sounds = d.sounds || []
  state.audio = d.audio || { bg: '', vol: 100 }
  state.fonts = d.fonts && d.fonts.length ? d.fonts : [defaultFont]
  clearSel()
  state.tool = 'select'
  n = Math.max(0, ...pages.flatMap(p => p.items.map(i => i.id || 0)))
  gn = Math.max(0, ...pages.flatMap(p => p.items.map(i => i.gid || 0)))
  pn = Math.max(0, ...pages.map(p => p.id))
  state.fonts.forEach(loadFont)
}

const loaded = new Set()

function ensureFont(name) {
  if (loaded.has(name) || state.fonts.find(f => f.name === name) || !googleSet.has(name)) return
  loaded.add(name)
  loadFont({ link: googleUrl(name) })
}

watch(() => state.pages.flatMap(p => p.items.filter(i => i.type === 'text').map(i => i.font)), names => names.forEach(ensureFont), { immediate: true })

const past = []
const future = []
let timer = 0
let cur = snap()

function snap() {
  return JSON.stringify({ pages: state.pages, backdrop: state.backdrop, fonts: state.fonts })
}

function commit() {
  clearTimeout(timer)
  timer = 0
  const s = snap()
  if (s === cur) return
  past.push(cur)
  if (past.length > 100) past.shift()
  future.length = 0
  cur = s
}

function apply(s) {
  const d = JSON.parse(s)
  state.pages = d.pages
  state.backdrop = d.backdrop
  state.fonts = d.fonts
  state.fonts.forEach(loadFont)
  state.page = Math.min(state.page, state.pages.length - 1)
  if (!state.items.find(i => i.id === state.sel)) state.sel = null
  state.multi = state.multi.filter(id => state.items.find(i => i.id === id))
}

export function undo() {
  commit()
  if (!past.length) return
  future.push(cur)
  cur = past.pop()
  apply(cur)
}

export function redo() {
  commit()
  if (!future.length) return
  past.push(cur)
  cur = future.pop()
  apply(cur)
}

watch(() => [state.pages, state.backdrop, state.fonts], () => {
  clearTimeout(timer)
  timer = setTimeout(commit, 300)
}, { deep: true })
