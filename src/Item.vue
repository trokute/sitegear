<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { state, select, selIds } from './store'
import { snapMove, strokePath } from './geom'
import { animVars } from './anim'
import { family } from './fonts'

const props = defineProps({ item: Object })

const corners = [
  { k: 'a', sx: -1, sy: -1 },
  { k: 'b', sx: 1, sy: -1 },
  { k: 'c', sx: -1, sy: 1 },
  { k: 'd', sx: 1, sy: 1 }
].map(c => ({ ...c, s: { left: c.sx < 0 ? '0%' : '100%', top: c.sy < 0 ? '0%' : '100%' } }))

const fx = ref(null)
const av = computed(() => props.item.gid ? null : animVars(props.item))
const keysOn = computed(() => !props.item.gid && !!(props.item.anim && props.item.anim.name === 'keys' && props.item.keys))
const op = computed(() => (props.item.opacity ?? 100) / 100)
const cst = computed(() => ({ opacity: keysOn.value ? 1 : op.value }))
const fxs = computed(() => ({ ...(av.value || {}), ...(keysOn.value ? { opacity: op.value } : {}) }))

function restart() {
  const el = fx.value
  if (!el || !av.value) return
  el.classList.remove('on')
  void el.offsetWidth
  el.classList.add('on')
}

function done() {
  if (fx.value) fx.value.classList.remove('on')
}

watch(() => state.play, p => {
  if (p && p.id === props.item.id) nextTick(restart)
})

const sel = computed(() => state.sel === props.item.id)
const multi = computed(() => state.multi.includes(props.item.id))
const sp = computed(() => props.item.type === 'stroke' ? strokePath(props.item.pts) : '')

const style = computed(() => ({
  left: props.item.x + 'px',
  top: props.item.y + 'px',
  width: props.item.w + 'px',
  height: props.item.h + 'px',
  transform: 'rotate(' + props.item.r + 'deg)'
}))

const tstyle = computed(() => ({
  ...cst.value,
  color: props.item.color,
  fontFamily: family(props.item.font),
  fontSize: props.item.size + 'px',
  lineHeight: props.item.lh
}))

const sstyle = computed(() => ({
  ...cst.value,
  background: props.item.color,
  borderRadius: props.item.type === 'circle' ? '50%' : props.item.radius + 'px'
}))

function point(e) {
  const b = document.getElementById('stage').getBoundingClientRect()
  return { x: (e.clientX - b.left) / state.zoom, y: (e.clientY - b.top) / state.zoom }
}

function track(e, fn, end) {
  const t = e.currentTarget
  t.setPointerCapture(e.pointerId)
  const up = () => {
    t.removeEventListener('pointermove', fn)
    t.removeEventListener('pointerup', up)
    if (end) end()
  }
  t.addEventListener('pointermove', fn)
  t.addEventListener('pointerup', up)
}

function ctx(e) {
  if (state.tool !== 'select') return
  if (!selIds().includes(props.item.id)) select(props.item.id)
  state.menu = { x: Math.min(e.clientX, window.innerWidth - 150), y: Math.min(e.clientY, window.innerHeight - 140) }
}

function drag(e) {
  if (e.button !== 0) return
  const it = props.item
  select(it.id, e.shiftKey)
  const ids = selIds()
  if (!ids.includes(it.id)) return
  const sx = e.clientX
  const sy = e.clientY
  const ox = it.x
  const oy = it.y
  const z = state.zoom
  if (ids.length > 1) {
    const all = state.items.filter(o => ids.includes(o.id)).map(o => ({ o, x: o.x, y: o.y }))
    const gs = [...new Set(all.map(g => g.o.gid).filter(Boolean))].filter(g => state.items.every(i => i.gid !== g || ids.includes(i.id)))
    const bx = gs.map(g => ({ b: state.pages[state.page].groups[g].box, x: state.pages[state.page].groups[g].box.x, y: state.pages[state.page].groups[g].box.y }))
    track(e, ev => {
      all.forEach(g => {
        g.o.x = g.x + (ev.clientX - sx) / z
        g.o.y = g.y + (ev.clientY - sy) / z
      })
      bx.forEach(g => {
        g.b.x = g.x + (ev.clientX - sx) / z
        g.b.y = g.y + (ev.clientY - sy) / z
      })
    })
    return
  }
  track(e, ev => {
    const x = ox + (ev.clientX - sx) / z
    const y = oy + (ev.clientY - sy) / z
    if (ev.altKey) {
      it.x = x
      it.y = y
      state.guides = []
      return
    }
    const s = snapMove(it, x, y, state.items, state.width, state.height, 6 / z)
    it.x = s.x
    it.y = s.y
    state.guides = s.guides
  }, () => {
    state.guides = []
  })
}

function resize(e, c) {
  const it = props.item
  const a = it.r * Math.PI / 180
  const co = Math.cos(a)
  const si = Math.sin(a)
  const cx = it.x + it.w / 2
  const cy = it.y + it.h / 2
  const ox = -c.sx * it.w / 2
  const oy = -c.sy * it.h / 2
  const fx = cx + ox * co - oy * si
  const fy = cy + ox * si + oy * co
  const ratio = it.w / it.h
  track(e, ev => {
    const p = point(ev)
    const dx = p.x - fx
    const dy = p.y - fy
    const lx = dx * co + dy * si
    const ly = -dx * si + dy * co
    const w = Math.max(10, lx * c.sx)
    const h = it.type === 'image' || it.type === 'stroke' ? w / ratio : Math.max(10, ly * c.sy)
    const mx = c.sx * w / 2
    const my = c.sy * h / 2
    const ncx = fx + mx * co - my * si
    const ncy = fy + mx * si + my * co
    it.w = w
    it.h = h
    it.x = ncx - w / 2
    it.y = ncy - h / 2
  })
}

function rotate(e) {
  const it = props.item
  const cx = it.x + it.w / 2
  const cy = it.y + it.h / 2
  track(e, ev => {
    const p = point(ev)
    let a = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90
    const q = Math.round(a / 45) * 45
    if (!ev.altKey && Math.abs(a - q) < 4) a = q
    it.r = Math.round(a * 10) / 10
  })
}
</script>

<template>
  <div class="item" :style="style" @pointerdown.stop="drag" @contextmenu.prevent.stop="ctx">
    <div ref="fx" class="fx" :style="fxs" @animationend="done">
      <img v-if="item.type === 'image'" :src="item.src" :style="cst" draggable="false">
      <svg v-else-if="item.type === 'stroke'" class="stk" :viewBox="'0 0 ' + item.ow + ' ' + item.oh" preserveAspectRatio="none" :style="cst">
        <path :d="sp" fill="none" :stroke="item.color" :stroke-width="item.sw" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div v-else-if="item.type === 'text'" class="txt" :style="tstyle">{{ item.text }}</div>
      <div v-else class="shape" :style="sstyle"></div>
    </div>
    <div v-if="multi" class="box multi"></div>
    <template v-if="sel">
      <div class="box"></div>
      <div class="stem"></div>
      <div class="rot" @pointerdown.stop="rotate"></div>
      <div v-for="c in corners" :key="c.k" class="h" :class="c.k" :style="c.s" @pointerdown.stop="resize($event, c)"></div>
    </template>
  </div>
</template>
