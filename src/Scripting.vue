<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import * as Blockly from 'blockly'
import { state, animTarget, renames } from './store'
import Icon from './Icon.vue'
import { toolbox, theme, setup, scan, forget } from './blocks'
import { addFiles } from './sounds'
import { drag } from './drag'

const root = ref(null)
const win = ref(null)
const inp = ref(null)
const ask = ref(null)
const pos = reactive({ x: 40, y: 40 })
const ap = reactive({ x: 0, y: 0 })
let ws = null
let ro = null
let stop = null

function rename(from, to) {
  ws.getAllBlocks(false).forEach(b => {
    for (const k of ['C', 'TO']) {
      if (b.getFieldValue(k) !== from) continue
      b.getField(k).getOptions(false)
      b.setFieldValue(to, k)
    }
  })
  forget(from)
}

watch(ask, (v, o) => {
  if (v && !o) Object.assign(ap, { x: (win.value.clientWidth - 280) / 2, y: (win.value.clientHeight - 140) / 2 })
  if (v && !v.confirm) nextTick(() => inp.value && inp.value.focus())
})

function done(yes) {
  const a = ask.value
  ask.value = null
  if (a.confirm) a.cb(yes)
  else a.cb(yes ? a.val : null)
}

function drop(e) {
  addFiles(e.dataTransfer.files, false)
}

function ctx() {
  const t = animTarget()
  return t && t.cls ? t.cls : ''
}

onMounted(() => {
  Blockly.dialog.setPrompt((msg, val, cb) => {
    ask.value = { msg, val: val || '', cb }
  })
  Blockly.dialog.setConfirm((msg, cb) => {
    ask.value = { msg, confirm: true, cb }
  })
  ws = Blockly.inject(root.value, {
    toolbox: toolbox(ctx()),
    theme,
    media: import.meta.env.BASE_URL + 'blockly/',
    trashcan: true,
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
    zoom: { controls: true, wheel: true, startScale: 0.9 }
  })
  setup(ws)
  if (state.script) {
    scan(state.script)
    Blockly.serialization.workspaces.load(JSON.parse(JSON.stringify(state.script)), ws)
  }
  ws.addChangeListener(Blockly.Events.disableOrphans)
  ws.addChangeListener(e => {
    if (e.isUiEvent) return
    state.script = Blockly.serialization.workspaces.save(ws)
  })
  stop = watch(ctx, c => ws.updateToolbox(toolbox(c)))
  renames.push(rename)
  ro = new ResizeObserver(() => Blockly.svgResize(ws))
  ro.observe(win.value)
})

onUnmounted(() => {
  renames.splice(renames.indexOf(rename), 1)
  stop()
  ro.disconnect()
  ws.dispose()
})
</script>

<template>
  <div ref="win" class="panel fixed script" @dragover.prevent @drop.prevent="drop" :style="{ left: pos.x + 'px', top: pos.y + 'px' }">
    <div class="head" @pointerdown="drag($event, pos)">
      <span>Scripting</span>
      <Icon class="push" title="Close" :n="25" :s="28" @click="state.coding = false" />
    </div>
    <div ref="root" class="blocks"></div>
    <div v-if="ask" class="panel ask" :style="{ left: ap.x + 'px', top: ap.y + 'px' }">
      <div class="head" @pointerdown="drag($event, ap)">
        <span>{{ ask.confirm ? 'Confirm' : 'Name' }}</span>
      </div>
      <div class="body">
        <div class="line">{{ ask.msg }}</div>
        <div v-if="!ask.confirm" class="line">
          <input ref="inp" v-model="ask.val" @keydown.enter="done(true)" @keydown.esc="done(false)">
        </div>
        <div class="line">
          <button class="tb" @click="done(true)">Ok</button>
          <button class="tb" @click="done(false)">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
