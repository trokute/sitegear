import { watch } from 'vue'
import { state, animTarget, target, gitem } from './store'

export const origins = { swing: '50% 0%' }

export const presets = [
  ['bounce', 'Bounce', '0%,100%{transform:translateY(0)}30%{transform:translateY(-45%)}50%{transform:translateY(0)}65%{transform:translateY(-15%)}80%{transform:translateY(0)}'],
  ['float', 'Float', '0%,100%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(4%,-10%) rotate(1.5deg)}66%{transform:translate(-4%,-5%) rotate(-1.5deg)}'],
  ['slide', 'Slide', '0%,100%{transform:translateX(-25%)}50%{transform:translateX(25%)}'],
  ['pulse', 'Pulse', '0%,100%{transform:scale(1)}50%{transform:scale(1.15)}'],
  ['spin', 'Spin', '0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}'],
  ['shake', 'Shake', '0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-4%)}20%,40%,60%,80%{transform:translateX(4%)}'],
  ['wobble', 'Wobble', '0%,100%{transform:translateX(0) rotate(0deg)}15%{transform:translateX(-8%) rotate(-5deg)}30%{transform:translateX(6%) rotate(3deg)}45%{transform:translateX(-5%) rotate(-3deg)}60%{transform:translateX(3%) rotate(2deg)}75%{transform:translateX(-2%) rotate(-1deg)}'],
  ['swing', 'Swing', '0%,100%{transform:rotate(15deg)}50%{transform:rotate(-15deg)}'],
  ['flip', 'Flip', '0%{transform:perspective(400px) rotateY(0deg)}100%{transform:perspective(400px) rotateY(360deg)}'],
  ['jelly', 'Jelly', '0%,100%{transform:scale(1,1)}25%{transform:scale(0.9,1.1)}50%{transform:scale(1.1,0.9)}75%{transform:scale(0.95,1.05)}'],
  ['heartbeat', 'Heartbeat', '0%,100%{transform:scale(1)}14%{transform:scale(1.2)}28%{transform:scale(1)}42%{transform:scale(1.2)}70%{transform:scale(1)}'],
  ['tada', 'Tada', '0%,100%{transform:scale(1) rotate(0deg)}10%,20%{transform:scale(0.9) rotate(-3deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(3deg)}40%,60%,80%{transform:scale(1.1) rotate(-3deg)}'],
  ['rubber', 'Rubber band', '0%,100%{transform:scale(1,1)}30%{transform:scale(1.25,0.75)}40%{transform:scale(0.75,1.25)}50%{transform:scale(1.15,0.85)}65%{transform:scale(0.95,1.05)}75%{transform:scale(1.05,0.95)}'],
  ['fade', 'Fade in', '0%{opacity:0}100%{opacity:1}'],
  ['blink', 'Blink', '0%,100%{opacity:1}50%{opacity:0}'],
  ['zoom', 'Zoom in', '0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}'],
  ['left', 'Slide left', '0%{transform:translateX(-120%);opacity:0}100%{transform:translateX(0);opacity:1}'],
  ['right', 'Slide right', '0%{transform:translateX(120%);opacity:0}100%{transform:translateX(0);opacity:1}'],
  ['up', 'Slide up', '0%{transform:translateY(120%);opacity:0}100%{transform:translateY(0);opacity:1}'],
  ['down', 'Slide down', '0%{transform:translateY(-120%);opacity:0}100%{transform:translateY(0);opacity:1}'],
  ['drop', 'Drop in', '0%{transform:translateY(-150%);opacity:0}50%{transform:translateY(0);opacity:1}65%{transform:translateY(-15%)}80%{transform:translateY(0)}90%{transform:translateY(-5%)}100%{transform:translateY(0)}'],
  ['orbit', 'Orbit', '0%{transform:rotate(0deg) translateX(20%) rotate(0deg)}100%{transform:rotate(360deg) translateX(20%) rotate(-360deg)}'],
  ['glitch', 'Glitch', '0%,100%{transform:translate(0,0) skewX(0deg)}20%{transform:translate(-3%,2%) skewX(8deg)}40%{transform:translate(3%,-2%) skewX(-8deg)}60%{transform:translate(-2%,-3%) skewX(4deg)}80%{transform:translate(2%,3%) skewX(-4deg)}']
]

export function kfRule(p) {
  return '@keyframes k-' + p[0] + '{' + p[2] + '}'
}

export function freeCss(it) {
  const f = it.free
  if (!f || !f.s.length) return ''
  const a = (it.grp ? 0 : it.r) * Math.PI / 180
  const co = Math.cos(a)
  const si = Math.sin(a)
  const [, cx0, cy0, r0, w0, h0] = f.s[0]
  const fr = f.s.map(([t, cx, cy, r, w, h]) => {
    const dx = cx - cx0
    const dy = cy - cy0
    const lx = dx * co + dy * si
    const ly = -dx * si + dy * co
    return (t / f.dur * 100).toFixed(2) + '%{transform:translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px) rotate(' + (r - r0).toFixed(1) + 'deg) scale(' + (w / w0).toFixed(3) + ',' + (h / h0).toFixed(3) + ')}'
  }).join('')
  return '@keyframes k-f' + it.id + '{' + fr + '}'
}

export function animVars(it) {
  const a = it.anim
  if (!a || !a.name) return null
  const free = a.name === 'free'
  if (free && !it.free) return null
  const keys = a.name === 'keys'
  if (keys && !it.keys) return null
  return {
    '--a': free ? 'k-f' + it.id : keys ? 'k-k' + it.id : 'k-' + a.name,
    '--d': free ? it.free.dur + 'ms' : keys ? it.keys.dur + 's' : a.dur + 's',
    '--e': free || keys ? 'linear' : 'ease-in-out',
    '--o': origins[a.name] || '50% 50%'
  }
}

let iv = 0
let ctx = null

function r1(v) {
  return Math.round(v * 10) / 10
}

function put(it, v) {
  if (it.put) it.put(v)
  else Object.assign(it, v)
}

export function startRec(it) {
  if (!it || state.rec) return
  const base = { x: it.x, y: it.y, w: it.w, h: it.h, r: it.r }
  const t0 = performance.now()
  const s = []
  const take = () => {
    const t = Math.min(10000, Math.round(performance.now() - t0))
    s.push([t, r1(it.x + it.w / 2), r1(it.y + it.h / 2), r1(it.r), r1(it.w), r1(it.h)])
    return t
  }
  take()
  ctx = { it, base, s, take }
  state.rec = { id: it.id, t: 0 }
  iv = setInterval(() => {
    const t = ctx.take()
    state.rec.t = t / 1000
    if (t >= 10000) stopRec()
  }, 50)
}

export function stopRec() {
  if (!state.rec || !ctx) return
  clearInterval(iv)
  const { it, base, s, take } = ctx
  take()
  const dur = Math.max(500, s[s.length - 1][0])
  if (s[s.length - 1][0] < dur) s.push([dur, ...s[s.length - 1].slice(1)])
  it.free = { dur, s }
  put(it, base)
  it.anim.name = 'free'
  state.rec = null
  ctx = null
  state.play = { id: it.id, n: Date.now() }
}

const named = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1]
}

export const eases = [
  ['linear', 'Linear'],
  ['ease', 'Ease'],
  ['ease-in', 'Ease in'],
  ['ease-out', 'Ease out'],
  ['ease-in-out', 'Ease in out'],
  ['cubic-bezier(0.34,1.56,0.64,1)', 'Overshoot'],
  ['cubic-bezier(0.36,0,0.66,-0.56)', 'Anticipate'],
  ['steps(1,end)', 'Hold']
]

function curve(e) {
  if (e === 'steps(1,end)') return null
  if (named[e]) return named[e]
  const m = e.match(/cubic-bezier\(([^)]+)\)/)
  return m ? m[1].split(',').map(Number) : named.ease
}

function solve(c, x) {
  if (!c) return x < 1 ? 0 : 1
  const [x1, y1, x2, y2] = c
  const bx = t => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t
  const by = t => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t
  let lo = 0
  let hi = 1
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2
    if (bx(m) < x) lo = m
    else hi = m
  }
  return by((lo + hi) / 2)
}

function sorted(k) {
  return [...k.frames].sort((a, b) => a.t - b.t)
}

export function pose(it, t) {
  const fs = sorted(it.keys)
  const last = fs[fs.length - 1]
  if (t <= fs[0].t) return fs[0]
  if (t >= last.t) return last
  let i = 0
  while (fs[i + 1].t <= t) i++
  const a = fs[i]
  const b = fs[i + 1]
  const p = solve(curve(a.ease), (t - a.t) / (b.t - a.t))
  const l = (u, v) => u + (v - u) * p
  return { x: l(a.x, b.x), y: l(a.y, b.y), w: l(a.w, b.w), h: l(a.h, b.h), r: l(a.r, b.r), o: l(a.o, b.o) }
}

export function applyPose(it, t) {
  const p = pose(it, t)
  put(it, { x: r1(p.x), y: r1(p.y), w: r1(p.w), h: r1(p.h), r: r1(p.r) })
  it.opacity = Math.round(p.o)
}

export function keysCss(it) {
  const k = it.keys
  if (!k || !k.frames.length) return ''
  const fs = sorted(k)
  const f0 = fs[0]
  const br = it.grp ? 0 : state.kf && state.kf.id === it.id ? f0.r : it.r
  const a = br * Math.PI / 180
  const co = Math.cos(a)
  const si = Math.sin(a)
  const cx0 = f0.x + f0.w / 2
  const cy0 = f0.y + f0.h / 2
  const rule = (p, f) => {
    const dx = f.x + f.w / 2 - cx0
    const dy = f.y + f.h / 2 - cy0
    const lx = dx * co + dy * si
    const ly = -dx * si + dy * co
    return Math.min(100, p).toFixed(2) + '%{transform:translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px) rotate(' + (f.r - f0.r).toFixed(1) + 'deg) scale(' + (f.w / f0.w).toFixed(3) + ',' + (f.h / f0.h).toFixed(3) + ');opacity:' + ((f.o ?? 100) / 100) + ';animation-timing-function:' + f.ease + '}'
  }
  const parts = fs.map(f => rule(f.t / k.dur * 100, f))
  if (fs[0].t > 0) parts.unshift(rule(0, fs[0]))
  if (fs[fs.length - 1].t < k.dur) parts.push(rule(100, fs[fs.length - 1]))
  return '@keyframes k-k' + it.id + '{' + parts.join('') + '}'
}

export function setKey(it, t) {
  const fr = it.keys.frames
  const i = fr.findIndex(f => Math.abs(f.t - t) < 0.005)
  const f = { t: i >= 0 ? fr[i].t : Math.round(t * 100) / 100, x: r1(it.x), y: r1(it.y), w: r1(it.w), h: r1(it.h), r: r1(it.r), o: it.opacity ?? 100, ease: i >= 0 ? fr[i].ease : 'ease-in-out' }
  if (i >= 0) fr[i] = f
  else {
    fr.push(f)
    fr.sort((a, b) => a.t - b.t)
  }
}

export function delKey(it, t) {
  const fr = it.keys.frames
  const i = fr.findIndex(f => Math.abs(f.t - t) < 0.005)
  if (i < 0 || fr.length < 2) return
  fr.splice(i, 1)
  applyPose(it, t)
}

export function setDur(it, v) {
  const d = Math.max(0.2, Number(v) || 2)
  it.keys.dur = d
  it.keys.frames.forEach(f => {
    f.t = Math.min(f.t, d)
  })
  if (state.kf) state.kf.t = Math.min(state.kf.t, d)
}

export function openKeys(it) {
  if (!it.keys) it.keys = { dur: 2, frames: [] }
  if (!it.keys.frames.length) setKey(it, 0)
  it.anim.name = 'keys'
  state.kf = { id: it.id, t: 0, playing: false }
  applyPose(it, 0)
}

export function closeKeys() {
  if (!state.kf) return
  const it = target(state.kf.id)
  state.kf = null
  if (it && it.keys && it.keys.frames.length) applyPose(it, 0)
}

export function playKeys(it) {
  const kf = state.kf
  kf.t = 0
  kf.playing = true
  applyPose(it, 0)
  state.play = { id: it.id, n: Date.now() }
  const t0 = performance.now()
  const step = () => {
    if (!state.kf || !kf.playing) return
    const t = (performance.now() - t0) / 1000
    if (t >= it.keys.dur) {
      kf.t = 0
      kf.playing = false
      return
    }
    kf.t = t
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(() => {
  const t = animTarget()
  return t ? t.id : null
}, id => {
  if (state.kf && state.kf.id !== id) closeKeys()
})

const css = presets.map(kfRule).join('')
const el = document.createElement('style')
document.head.appendChild(el)

watch(() => state.pages.flatMap(p => [...p.items, ...Object.keys(p.groups).map(g => gitem(Number(g), p))].map(i => (i.free ? freeCss(i) : '') + (i.keys ? keysCss(i) : ''))).join(''), extra => {
  el.textContent = css + extra
}, { immediate: true })
