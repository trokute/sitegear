<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted } from 'vue'
import { state, remove, addShape, addImage, addStroke, undo, redo, selIds, clearSel, pick, group, ungroup, animTarget, copy, cut, paste, duplicate, taken, renameClass, fail } from './store'
import { strokePath, bounds } from './geom'
import Item from './Item.vue'
import Group from './Group.vue'
import Toolbar from './Toolbar.vue'
import Layers from './Layers.vue'
import Document from './Document.vue'
import Animation from './Animation.vue'
import Notice from './Notice.vue'
import ErrorBar from './ErrorBar.vue'
import { stopRec } from './anim'
import { dropFile } from './media'
import Widgets from './Widgets.vue'
import Pick from './Pick.vue'
import Help from './Help.vue'
import Projects from './Projects.vue'
import Confirm from './Confirm.vue'

const Scripting = defineAsyncComponent(() => import('./Scripting.vue'))
const Code = defineAsyncComponent(() => import('./Code.vue'))

const z = computed(() => state.zoom)
const rows = computed(() => {
  const seen = new Set()
  const r = []
  state.items.forEach(i => {
    if (!i.gid) r.push({ key: i.id, item: i })
    else if (!seen.has(i.gid)) {
      seen.add(i.gid)
      r.push({ key: 'g' + i.gid, gid: i.gid, items: state.items.filter(o => o.gid === i.gid) })
    }
  })
  return r
})
const tg = computed(animTarget)
const dp = computed(() => state.draft ? strokePath(state.draft.pts) : '')
const can = computed(() => state.items.some(i => selIds().includes(i.id) && i.gid))
const gb = computed(() => {
  if (!state.multi.length) return null
  const bs = state.items.filter(i => state.multi.includes(i.id)).map(i => bounds(i))
  const l = Math.min(...bs.map(b => b.l))
  const t = Math.min(...bs.map(b => b.t))
  return { left: l + 'px', top: t + 'px', width: Math.max(...bs.map(b => b.r)) - l + 'px', height: Math.max(...bs.map(b => b.b)) - t + 'px' }
})

function box() {
  return document.getElementById('stage').getBoundingClientRect()
}

function key(e) {
  if (!state.project) return
  if (e.key === 'Enter' && state.rec) {
    e.preventDefault()
    stopRec()
    return
  }
  if (e.key === 'Escape' && state.help) state.help = false
  const k = e.key.toLowerCase()
  if ((e.ctrlKey || e.metaKey) && k === 'd') e.preventDefault()
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.closest('.script')) return
  if (e.ctrlKey || e.metaKey) {
    if (k === 'z') {
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    } else if (k === 'y') {
      e.preventDefault()
      redo()
    } else if (k === 'c') {
      copy()
    } else if (k === 'x') {
      cut()
    } else if (k === 'v') {
      paste()
    } else if (k === 'd') {
      duplicate()
    }
    return
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && selIds().length) {
    e.preventDefault()
    remove()
  }
}

function pencil(e) {
  const b = box()
  const k = z.value
  const pt = ev => [(ev.clientX - b.left) / k, (ev.clientY - b.top) / k]
  state.draft = { pts: [pt(e)], color: state.pen.color, sw: state.pen.width }
  const d = state.draft
  const move = ev => {
    const p = pt(ev)
    const l = d.pts[d.pts.length - 1]
    if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 1.5) d.pts.push(p)
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    addStroke(d.pts.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]), d.color, d.sw)
    state.draft = null
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function bg(e) {
  if (e.button !== 0) return
  const b = box()
  const k = z.value
  const sx = (e.clientX - b.left) / k
  const sy = (e.clientY - b.top) / k
  const keep = e.shiftKey ? selIds() : []
  clearSel()
  state.marq = { left: sx, top: sy, width: 0, height: 0 }
  const move = ev => {
    const px = (ev.clientX - b.left) / k
    const py = (ev.clientY - b.top) / k
    const m = state.marq
    m.left = Math.min(sx, px)
    m.top = Math.min(sy, py)
    m.width = Math.abs(px - sx)
    m.height = Math.abs(py - sy)
    const hit = state.items.filter(i => {
      const o = bounds(i)
      return o.l < m.left + m.width && o.r > m.left && o.t < m.top + m.height && o.b > m.top
    })
    const gs = hit.map(i => i.gid).filter(Boolean)
    const ids = state.items.filter(i => hit.includes(i) || gs.includes(i.gid) && i.gid).map(i => i.id)
    pick([...new Set([...keep, ...ids])])
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    state.marq = null
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function shut(e) {
  if (state.menu && !e.target.closest('.menu')) state.menu = null
}

function cleanCls(e) {
  e.target.value = e.target.value.replace(/[^\w-]/g, '')
}

function setCls(e) {
  const t = tg.value
  const v = e.target.value
  if (v && taken(v, t)) {
    fail('Name already used')
    e.target.value = t.cls || ''
    return
  }
  const was = t.cls || ''
  t.cls = v
  if (v && was && was !== v && !taken(was, t)) renameClass(was, v)
  state.menu = null
}

function doGroup() {
  group()
  state.menu = null
}

function doUngroup() {
  ungroup()
  state.menu = null
}

function down(e) {
  if (state.tool === 'select') return
  e.stopPropagation()
  if (e.button !== 0) return
  if (state.tool === 'pencil') {
    pencil(e)
    return
  }
  const b = box()
  const k = z.value
  const sx = (e.clientX - b.left) / k
  const sy = (e.clientY - b.top) / k
  const it = addShape(state.tool, sx, sy, 1, 1)
  const move = ev => {
    const px = (ev.clientX - b.left) / k
    const py = (ev.clientY - b.top) / k
    it.x = Math.min(sx, px)
    it.y = Math.min(sy, py)
    it.w = Math.max(1, Math.abs(px - sx))
    it.h = Math.max(1, Math.abs(py - sy))
  }
  const up = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    if (it.w < 10 && it.h < 10) {
      it.w = 120
      it.h = 120
    }
    state.tool = 'select'
  }
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
}

function drop(e) {
  const b = box()
  let x = (e.clientX - b.left) / z.value
  let y = (e.clientY - b.top) / z.value
  for (const f of e.dataTransfer.files) {
    if (f.type.startsWith('audio/') || f.type.startsWith('video/')) {
      dropFile(f, x, y)
      continue
    }
    if (!f.type.startsWith('image/')) continue
    const px = x
    const py = y
    const r = new FileReader()
    r.onload = () => addImage(r.result, px, py)
    r.readAsDataURL(f)
    x += 20
    y += 20
  }
}

onMounted(() => {
  window.addEventListener('keydown', key)
  window.addEventListener('pointerdown', shut, true)
})
onUnmounted(() => {
  window.removeEventListener('keydown', key)
  window.removeEventListener('pointerdown', shut, true)
})
</script>

<template>
  <Projects v-if="!state.project" />
  <template v-else>
    <div class="work" :class="{ draw: state.tool !== 'select' }" :style="{ background: state.backdrop }" @pointerdown.capture="down" @pointerdown="bg" @dragover.prevent @drop.prevent="drop">
      <div class="frame" :style="{ width: state.width * z + 'px', height: state.height * z + 'px' }">
        <div id="stage" class="stage" :style="{ width: state.width + 'px', height: state.height + 'px', background: state.bg, transform: 'scale(' + z + ')', '--z': z }">
          <template v-for="r in rows" :key="r.key">
            <Group v-if="r.gid" :gid="r.gid" :items="r.items" />
            <Item v-else :item="r.item" />
          </template>
          <svg v-if="state.draft" class="draft" :width="state.width" :height="state.height">
            <path :d="dp" fill="none" :stroke="state.draft.color" :stroke-width="state.draft.sw" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div v-if="gb" class="gbox" :style="gb"></div>
          <div v-if="state.marq" class="marq" :style="{ left: state.marq.left + 'px', top: state.marq.top + 'px', width: state.marq.width + 'px', height: state.marq.height + 'px' }"></div>
          <div v-for="(g, i) in state.guides" :key="i" class="guide" :style="g.v ? { left: g.p + 'px', top: 0, bottom: 0, width: '1px' } : { top: g.p + 'px', left: 0, right: 0, height: '1px' }"></div>
        </div>
      </div>
    </div>
    <div class="col">
      <Animation />
      <Toolbar />
    </div>
    <div v-if="state.menu" class="panel menu" :style="{ left: state.menu.x + 'px', top: state.menu.y + 'px' }" @contextmenu.prevent>
      <button class="tb" :disabled="selIds().length < 2" @click="doGroup">Group</button>
      <button class="tb" :disabled="!can" @click="doUngroup">Ungroup</button>
      <input v-if="tg" class="cls" :value="tg.cls || ''" placeholder="Name" @input="cleanCls" @keydown.enter="setCls">
    </div>
    <Document />
    <Layers />
    <Scripting v-if="state.coding && state.mode === 'blockly'" />
    <Code v-if="state.coding && state.mode === 'js'" />
    <Widgets v-if="state.widgets" />
    <Pick />
    <Help v-if="state.help" />
    <Notice />
  </template>
  <Confirm />
  <ErrorBar />
</template>
