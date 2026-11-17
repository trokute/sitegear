<script setup>
import { ref } from 'vue'
import { state, selected, addPage, deletePage, go, copyPage, align } from './store'
import { ic } from './icon'
import { addLink, addFiles, removeSound, preview } from './sounds'

const open = ref(true)
const src = ref(0)
const bgLink = ref('')
const sndLink = ref('')

const sizes = [
  { name: 'Desktop', w: 1280, h: 900 },
  { name: 'Tablet', w: 768, h: 1024 },
  { name: 'Phone', w: 390, h: 844 }
]

const aligns = ['left', 'center', 'right', 'top', 'middle', 'bottom']

function addBg() {
  addLink(bgLink.value, true)
  bgLink.value = ''
}

function addSnd() {
  addLink(sndLink.value, false)
  sndLink.value = ''
}

function size(s) {
  state.width = s.w
  state.height = s.h
}
</script>

<template>
  <div class="panel fixed doc">
    <div class="head" @click="open = !open">
      <span>Document</span>
      <button class="ic" title="New page" :style="ic(13, 28)" @click.stop="addPage"></button>
      <button class="ic" title="Previous page" :style="ic(15, 28)" :disabled="state.page === 0" @click.stop="go(-1)"></button>
      <button class="ic" title="Next page" :style="ic(14, 28)" :disabled="state.page === state.pages.length - 1" @click.stop="go(1)"></button>
      <button class="ic push" title="Delete page" :style="ic(12, 28)" :disabled="state.pages.length < 2" @click.stop="deletePage"></button>
    </div>
    <div v-if="open" class="body">
      <div class="line">
        <button class="tb" @click="state.coding = !state.coding">Open scripting window</button>
      </div>
      <div class="line">Page {{ state.page + 1 }} of {{ state.pages.length }}</div>
      <h4>Size</h4>
      <div class="line">
        <label>Width</label>
        <input type="number" v-model.number="state.width" min="100">
      </div>
      <div class="line">
        <label>Height</label>
        <input type="number" v-model.number="state.height" min="100">
      </div>
      <div class="line">
        <button v-for="s in sizes" :key="s.name" class="tb" @click="size(s)">{{ s.name }}</button>
      </div>
      <div class="line">
        <label>Page</label>
        <input type="color" v-model="state.bg">
      </div>
      <div class="line">
        <label>Backdrop</label>
        <input type="color" v-model="state.backdrop">
      </div>
      <h4>Audio</h4>
      <div class="line">
        <label>Background</label>
        <select v-model="state.audio.bg">
          <option value="">None</option>
          <option v-for="s in state.sounds" :key="s.name" :value="s.name">{{ s.name }}</option>
        </select>
      </div>
      <div class="line">
        <label>Volume</label>
        <input type="range" min="0" max="100" v-model.number="state.audio.vol">
        <span>{{ state.audio.vol }}</span>
      </div>
      <div class="line" @dragover.prevent @drop.prevent="addFiles($event.dataTransfer.files, true)">
        <input v-model="bgLink" placeholder="Background link or drop a file" @keydown.enter="addBg">
        <button class="tb" @click="addBg">Add</button>
      </div>
      <h4>Sounds</h4>
      <div class="line" @dragover.prevent @drop.prevent="addFiles($event.dataTransfer.files, false)">
        <input v-model="sndLink" placeholder="Sound link or drop a file" @keydown.enter="addSnd">
        <button class="tb" @click="addSnd">Add</button>
      </div>
      <div v-for="(s, i) in state.sounds" :key="s.name" class="line">
        <span class="lname">{{ s.name }}</span>
        <button class="tb" @click="preview(s)">Play</button>
        <button class="ic" title="Delete sound" :style="ic(12, 28)" @click="removeSound(i)"></button>
      </div>
      <h4>Copy from</h4>
      <div class="line">
        <select v-model="src">
          <template v-for="(p, i) in state.pages" :key="p.id">
            <option v-if="i !== state.page" :value="i">Page {{ i + 1 }}</option>
          </template>
        </select>
        <button class="ic" title="Duplicate page" :style="ic(16)" @click="copyPage(src)"></button>
      </div>
      <h4>Align</h4>
      <div class="line">
        <button v-for="a in aligns" :key="a" class="tb" :disabled="!selected()" @click="align(a)">{{ a }}</button>
      </div>
    </div>
  </div>
</template>
