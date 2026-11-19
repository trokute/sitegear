<script setup>
import { computed, ref } from 'vue'
import { state, animTarget } from './store'
import Preview from './Preview.vue'
import Icon from './Icon.vue'
import { presets, origins, eases, startRec, stopRec, applyPose, setKey, delKey, setDur, openKeys, closeKeys, playKeys } from './anim'

const open = ref(false)
const track = ref(null)
const it = computed(animTarget)
const editing = computed(() => !!(it.value && state.kf && state.kf.id === it.value.id))

const triggers = [
  ['loop', 'Loop'],
  ['page', 'Page open'],
  ['site', 'Site open'],
  ['hover', 'Hover'],
  ['click', 'Click']
]

const cur = computed(() => {
  if (!editing.value || !it.value.keys) return null
  return it.value.keys.frames.find(f => Math.abs(f.t - state.kf.t) < 0.005)
})

const easeKey = computed(() => {
  if (!cur.value) return ''
  return eases.some(e => e[0] === cur.value.ease) ? cur.value.ease : 'custom'
})

const bez = computed(() => {
  const m = cur.value && cur.value.ease.match(/\(([^)]+)\)/)
  return m ? m[1].split(',').map(Number) : [0.25, 0.1, 0.25, 1]
})

function play() {
  const i = it.value
  if (!i || !i.anim.name) return
  if (editing.value) playKeys(i)
  else state.play = { id: i.id, n: Date.now() }
}

function pick(name) {
  const i = it.value
  if (!i || (name === 'free' && !i.free) || (name === 'keys' && !i.keys)) return
  closeKeys()
  i.anim.name = i.anim.name === name ? '' : name
  play()
}

function clear() {
  closeKeys()
  it.value.anim.name = ''
}

function rec(e) {
  e.currentTarget.blur()
  closeKeys()
  startRec(it.value)
}

function toggleKeys() {
  if (editing.value) closeKeys()
  else openKeys(it.value)
}

function at(e) {
  const b = track.value.getBoundingClientRect()
  const k = Math.max(0, Math.min(1, (e.clientX - b.left) / b.width))
  return Math.round(k * it.value.keys.dur * 100) / 100
}

function scrub(e) {
  const i = it.value
  state.kf.playing = false
  const go = ev => {
    state.kf.t = at(ev)
    applyPose(i, state.kf.t)
  }
  go(e)
  const t = e.currentTarget
  t.setPointerCapture(e.pointerId)
  t.addEventListener('pointermove', go)
  t.addEventListener('pointerup', () => t.removeEventListener('pointermove', go), { once: true })
}

function dragKey(e, f) {
  const i = it.value
  state.kf.playing = false
  state.kf.t = f.t
  applyPose(i, f.t)
  const t = e.currentTarget
  t.setPointerCapture(e.pointerId)
  const move = ev => {
    f.t = at(ev)
    state.kf.t = f.t
  }
  const up = () => {
    t.removeEventListener('pointermove', move)
    i.keys.frames.sort((a, b) => a.t - b.t)
  }
  t.addEventListener('pointermove', move)
  t.addEventListener('pointerup', up, { once: true })
}

function jump(d) {
  const i = it.value
  const ts = i.keys.frames.map(f => f.t).sort((a, b) => a - b)
  const t = state.kf.t
  const n = d > 0 ? ts.find(v => v > t + 0.005) : [...ts].reverse().find(v => v < t - 0.005)
  if (n === undefined) return
  state.kf.playing = false
  state.kf.t = n
  applyPose(i, n)
}

function setEase(v) {
  cur.value.ease = v === 'custom' ? 'cubic-bezier(0.25,0.1,0.25,1)' : v
}

function setBez(n, v) {
  const a = [...bez.value]
  const x = Number(v)
  a[n] = n === 0 || n === 2 ? Math.max(0, Math.min(1, x)) : x
  cur.value.ease = 'cubic-bezier(' + a.join(',') + ')'
}
</script>

<template>
  <div class="panel anim">
    <div class="head" @click="open = !open">Animation</div>
    <div v-if="open" class="body">
      <template v-if="it">
        <div class="line">
          <label>Play on</label>
          <select v-model="it.anim.on">
            <option v-for="t in triggers" :key="t[0]" :value="t[0]">{{ t[1] }}</option>
          </select>
        </div>
        <div class="line" v-if="it.anim.name !== 'free' && it.anim.name !== 'keys'">
          <label>Seconds</label>
          <input type="number" v-model.number="it.anim.dur" min="0.1" step="0.1">
        </div>
        <div class="line">
          <Icon title="Play" :n="20" :s="28" :disabled="!it.anim.name" @click="play" />
          <button class="tb" :disabled="!it.anim.name" @click="clear">None</button>
        </div>
        <div class="card free" :class="{ on: it.anim.name === 'free' }" @click="pick('free')">
          <div class="pv">
            <Preview v-if="it.free" :it="it" :anim="'k-f' + it.id + ' ' + it.free.dur + 'ms linear infinite'" />
          </div>
          <div class="fm">
            <button v-if="!state.rec" class="tb" @click.stop="rec">Record</button>
            <button v-else class="tb" @click.stop="stopRec">Stop {{ state.rec.t.toFixed(1) }}s</button>
          </div>
        </div>
        <div class="card free" :class="{ on: it.anim.name === 'keys' }" @click="pick('keys')">
          <div class="pv">
            <Preview v-if="it.keys" :it="it" :anim="'k-k' + it.id + ' ' + it.keys.dur + 's linear infinite'" />
          </div>
          <div class="fm">
            <button class="tb" @click.stop="toggleKeys">{{ editing ? 'Done' : 'Keyframes' }}</button>
          </div>
        </div>
        <div v-if="editing" class="kf">
          <div ref="track" class="track" @pointerdown="scrub">
            <div v-for="(f, i) in it.keys.frames" :key="i" class="mk" :class="{ on: Math.abs(f.t - state.kf.t) < 0.005 }" :style="{ left: 'calc(' + f.t / it.keys.dur * 100 + '% - 6px)' }" @pointerdown.stop="dragKey($event, f)"></div>
            <div class="ph" :style="{ left: state.kf.t / it.keys.dur * 100 + '%' }"></div>
          </div>
          <div class="line">{{ state.kf.t.toFixed(2) }}s of {{ it.keys.dur }}s</div>
          <div class="line">
            <Icon title="New keyframe" :n="21" :s="28" @click="setKey(it, state.kf.t)" />
            <Icon title="Delete keyframe" :n="22" :s="28" :disabled="!cur || it.keys.frames.length < 2" @click="delKey(it, state.kf.t)" />
            <Icon title="Previous keyframe" :n="23" :s="28" @click="jump(-1)" />
            <Icon title="Next keyframe" :n="24" :s="28" @click="jump(1)" />
          </div>
          <div class="line">
            <label>Length</label>
            <input type="number" :value="it.keys.dur" min="0.2" step="0.1" @change="setDur(it, $event.target.value)">
          </div>
          <template v-if="cur">
            <div class="line">
              <label>Ease</label>
              <select :value="easeKey" @change="setEase($event.target.value)">
                <option v-for="e in eases" :key="e[0]" :value="e[0]">{{ e[1] }}</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div class="line" v-if="easeKey === 'custom'">
              <input v-for="n in 4" :key="n" type="number" step="0.05" :value="bez[n - 1]" @input="setBez(n - 1, $event.target.value)">
            </div>
          </template>
        </div>
        <div class="grid">
          <div v-for="p in presets" :key="p[0]" class="card" :class="{ on: it.anim.name === p[0] }" @click="pick(p[0])">
            <div class="pv">
              <Preview :it="it" :anim="'k-' + p[0] + ' 1.4s ease-in-out infinite'" :origin="origins[p[0]]" />
            </div>
            <div class="cn">{{ p[1] }}</div>
          </div>
        </div>
      </template>
      <div v-else>Select an element</div>
    </div>
  </div>
</template>
