<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript'
import { syntaxTree } from '@codemirror/language'
import { linter, lintGutter } from '@codemirror/lint'
import { state, classes, scripts, holder, selKey, focus } from './store'
import { sgDocs, elDocs } from './api'
import { drag } from './drag'
import Icon from './Icon.vue'

const root = ref(null)
const pos = reactive({ x: 40, y: 40 })
let view = null

const active = computed(() => holder(state.tab) ? state.tab : 'main')
const cur = computed(() => holder(active.value))
const tabs = computed(() => [{ key: 'main', label: 'Main' }, ...scripts().filter(s => s.obj.js && s.obj.js.trim() || s.key === active.value)])

const members = (docs, from) => ({
  from,
  validFor: /^\w*$/,
  options: docs.map(d => ({ label: d[0], type: d[3] ? 'property' : 'function', detail: d[1], info: d[2] }))
})

function complete(c) {
  const dot = c.matchBefore(/[\w$]+\.\w*/)
  if (dot) {
    const o = dot.text.split('.')[0]
    const from = dot.from + o.length + 1
    if (o === 'sg') return members(sgDocs, from)
    return o === 'this' || classes().includes(o) ? members(elDocs, from) : null
  }
  const q = c.matchBefore(/(["'])[\w:-]*/)
  if (q) return { from: q.from + 1, validFor: /^[\w:-]*$/, options: classes().map(label => ({ label, type: 'constant' })) }
  const w = c.matchBefore(/\w+/)
  if (!w || w.to - w.from < 2 && !c.explicit) return null
  return { from: w.from, validFor: /^\w*$/, options: [{ label: 'sg', type: 'namespace' }, { label: 'this', type: 'keyword' }, ...classes().map(label => ({ label, type: 'variable' }))] }
}

const syntax = linter(v => {
  const out = []
  syntaxTree(v.state).iterate({
    enter: n => {
      if (n.type.isError) out.push({ from: n.from, to: Math.max(n.to, n.from + 1), severity: 'error', message: 'Syntax error' })
    }
  })
  return out
})

const make = doc => EditorState.create({
  doc,
  extensions: [
    basicSetup,
    javascript(),
    syntax,
    lintGutter(),
    javascriptLanguage.data.of({ autocomplete: complete }),
    EditorView.theme({ '&': { height: '100%', backgroundColor: '#fff' }, '.cm-scroller': { fontFamily: 'monospace' } }),
    EditorView.updateListener.of(v => {
      if (!v.docChanged) return
      const t = v.state.doc.toString()
      if (t !== (cur.value.js || '')) cur.value.js = t
    })
  ]
})

function sync() {
  const t = cur.value.js || ''
  if (t !== view.state.doc.toString()) view.setState(make(t))
}

onMounted(() => {
  view = new EditorView({ state: make(cur.value.js || ''), parent: root.value })
})

watch(() => cur.value.js, sync)
watch(active, sync)
watch(selKey, k => {
  state.tab = k
})

onUnmounted(() => view.destroy())
</script>

<template>
  <div class="panel fixed script" :style="{ left: pos.x + 'px', top: pos.y + 'px' }">
    <div class="head" @pointerdown="drag($event, pos)">
      <span>Scripting</span>
      <Icon class="push" title="Close" :n="25" :s="28" @click="state.coding = false" />
    </div>
    <div ref="root" class="blocks"></div>
    <div class="tabs">
      <button v-for="t in tabs" :key="t.key" class="tb" :class="{ on: t.key === active }" @click="focus(t.key)">{{ t.label }}</button>
    </div>
  </div>
</template>
