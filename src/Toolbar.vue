<script setup>
import { computed, ref } from 'vue'
import { state, selected, animTarget, selIds, addText, addImage, addFont, loadFont, remove, undo, redo } from './store'
import { preview, download } from './export'
import { ic } from './icon'
import { googleFonts, googleAll, family } from './fonts'
import { save, open as openFile } from './project'
import { offer } from './media'

const open = ref(true)
const link = ref('')
const fontLink = ref('')
const mediaLink = ref('')
const slot = ref('mine')
const slotLink = ref('')
const slots = ['mine', 'tile', 'flag', '1', '2', '3', '4', '5', '6', '7', '8']
const titles = { text: 'Text', image: 'Image', rect: 'Rectangle', stroke: 'Stroke', widget: 'Widget', media: 'Media' }
const plain = ['image', 'widget', 'media']
const file = ref(null)
const it = computed(selected)
const gi = computed(() => {
  const t = animTarget()
  return t && t.grp && !it.value ? t : null
})

function img() {
  addImage(link.value.trim())
  link.value = ''
}

function media() {
  offer(mediaLink.value)
  mediaLink.value = ''
}

function setSlot() {
  const v = slotLink.value.trim()
  if (v) it.value.cfg.img[slot.value] = v
  slotLink.value = ''
}

function dropSlot(e) {
  const f = e.dataTransfer.files[0]
  if (!f || !f.type.startsWith('image/')) return
  const r = new FileReader()
  r.onload = () => {
    it.value.cfg.img[slot.value] = r.result
  }
  r.readAsDataURL(f)
}

function clearSlot() {
  delete it.value.cfg.img[slot.value]
}

function font() {
  addFont(fontLink.value)
  fontLink.value = ''
}

function fonts() {
  loadFont({ link: googleAll })
}

function pick(e) {
  const f = e.target.files[0]
  if (f) openFile(f)
  e.target.value = ''
}

function tool(t) {
  state.tool = t
}
</script>

<template>
  <div class="panel tools">
    <div class="head" @click="open = !open">
      <span>Tool Bar</span>
      <button class="ic" title="Delete" :style="ic(12, 28)" :disabled="!selIds().length" @click.stop="remove"></button>
      <button class="ic" title="Undo" :style="ic(18, 28)" @click.stop="undo"></button>
      <button class="ic" title="Redo" :style="ic(19, 28)" @click.stop="redo"></button>
    </div>
    <div v-if="open" class="body">
      <div class="line">
        <button class="ic" title="Select" :class="{ on: state.tool === 'select' }" :style="ic(2)" @click="tool('select')"></button>
        <button class="ic" title="Rectangle" :class="{ on: state.tool === 'rect' }" :style="ic(3)" @click="tool('rect')"></button>
        <button class="ic" title="Circle" :class="{ on: state.tool === 'circle' }" :style="ic(4)" @click="tool('circle')"></button>
        <button class="ic" title="Text" :style="ic(5)" @click="addText"></button>
        <button class="ic" title="Pencil" :class="{ on: state.tool === 'pencil' }" :style="ic(17)" @click="tool('pencil')"></button>
      </div>
      <div class="line">
        <button class="ic" title="Save" :style="ic(6)" @click="save"></button>
        <button class="ic" title="Open" :style="ic(7)" @click="file.click()"></button>
        <button class="ic" title="Preview" :style="ic(8)" @click="preview"></button>
        <button class="ic" title="Export" :style="ic(9)" @click="download"></button>
        <input ref="file" type="file" accept=".json,application/json" hidden @change="pick">
      </div>
      <div class="line">
        <input v-model="link" placeholder="Image link or drop a file" @keydown.enter="img">
        <button class="ic" title="Add image" :style="ic(10)" @click="img"></button>
      </div>
      <div class="line">
        <input v-model="mediaLink" placeholder="Video or audio link" @keydown.enter="media">
        <button class="tb" title="Add media" @click="media">Add</button>
      </div>
      <div class="line">
        <input v-model="fontLink" placeholder="Font link" @keydown.enter="font">
        <button class="ic" title="Add font" :style="ic(11)" @click="font"></button>
      </div>
      <template v-if="state.tool === 'pencil' && !it">
        <h4>Pencil</h4>
        <div class="line">
          <label>Color</label>
          <input type="color" v-model="state.pen.color">
        </div>
        <div class="line">
          <label>Size</label>
          <input type="number" v-model.number="state.pen.width" min="1">
        </div>
      </template>
      <template v-if="gi">
        <h4>Group</h4>
        <div class="line">
          <label>X</label>
          <input type="number" v-model.number="gi.x">
        </div>
        <div class="line">
          <label>Y</label>
          <input type="number" v-model.number="gi.y">
        </div>
        <div class="line">
          <label>Width</label>
          <input type="number" v-model.number="gi.w" min="1">
        </div>
        <div class="line">
          <label>Height</label>
          <input type="number" v-model.number="gi.h" min="1">
        </div>
        <div class="line">
          <label>Opacity</label>
          <input type="range" min="0" max="100" v-model.number="gi.opacity">
          <span>{{ gi.opacity }}</span>
        </div>
        <div class="line">
          <label>Angle</label>
          <input type="number" v-model.number="gi.r">
        </div>
      </template>
      <template v-if="it">
        <h4>{{ titles[it.type] || 'Circle' }}</h4>
        <div class="line" v-if="it.type === 'text'">
          <textarea v-model="it.text" rows="3"></textarea>
        </div>
        <div class="line" v-if="it.type === 'image' && !it.src.startsWith('data:')">
          <label>Link</label>
          <input v-model="it.src">
        </div>
        <div class="line" v-if="it.type === 'media' && !it.src.startsWith('data:')">
          <label>Link</label>
          <input v-model="it.src">
        </div>
        <template v-if="it.type === 'widget' && it.kind === 'wordle'">
          <div class="line">
            <label>Word</label>
            <input v-model="it.cfg.word">
          </div>
          <div class="line">
            <label>Guesses</label>
            <input type="number" v-model.number="it.cfg.max" min="1" max="12">
          </div>
        </template>
        <template v-if="it.type === 'widget' && it.kind === 'mines'">
          <div class="line">
            <label>Mines</label>
            <input type="number" v-model.number="it.cfg.mines" min="1" max="80">
          </div>
          <div class="line">
            <label>Graphics</label>
            <select v-model="it.cfg.custom">
              <option :value="false">Default</option>
              <option :value="true">Custom</option>
            </select>
          </div>
          <template v-if="it.cfg.custom">
            <div class="line">
              <label>Tile</label>
              <select v-model="slot">
                <option v-for="s in slots" :key="s" :value="s">{{ s }}</option>
              </select>
              <button class="ic" title="Clear" :style="ic(12, 28)" :disabled="!it.cfg.img[slot]" @click="clearSlot"></button>
            </div>
            <div class="line" @dragover.prevent @drop.prevent="dropSlot">
              <input v-model="slotLink" placeholder="Image link or drop a file" @keydown.enter="setSlot">
              <button class="tb" @click="setSlot">Set</button>
            </div>
          </template>
        </template>
        <template v-if="it.type === 'text'">
          <div class="line">
            <label>Font</label>
            <select v-model="it.font" @focus="fonts">
              <option v-for="f in state.fonts" :key="f.name" :value="f.name" :style="{ fontFamily: family(f.name) }">{{ f.name }}</option>
              <optgroup label="Google Fonts">
                <option v-for="g in googleFonts" :key="g" :value="g" :style="{ fontFamily: family(g) }">{{ g }}</option>
              </optgroup>
              <optgroup label="System">
                <option style="font-family: sans-serif">sans-serif</option>
                <option style="font-family: serif">serif</option>
                <option style="font-family: monospace">monospace</option>
              </optgroup>
            </select>
          </div>
          <div class="line">
            <label>Size</label>
            <input type="number" v-model.number="it.size" min="1">
          </div>
          <div class="line">
            <label>Line</label>
            <input type="number" v-model.number="it.lh" min="0.5" step="0.1">
          </div>
        </template>
        <div class="line" v-if="!plain.includes(it.type)">
          <label>Color</label>
          <input type="color" v-model="it.color">
        </div>
        <div class="line" v-if="it.type === 'stroke'">
          <label>Size</label>
          <input type="number" v-model.number="it.sw" min="1">
        </div>
        <div class="line" v-if="it.type === 'rect'">
          <label>Round</label>
          <input type="number" v-model.number="it.radius" min="0">
        </div>
        <div class="line">
          <label>Opacity</label>
          <input type="range" min="0" max="100" v-model.number="it.opacity">
          <span>{{ it.opacity ?? 100 }}</span>
        </div>
        <div class="line">
          <label>Goes to</label>
          <select v-model="it.link">
            <option value="">None</option>
            <option value="next">Next page</option>
            <option value="prev">Previous page</option>
            <option v-for="(p, i) in state.pages" :key="p.id" :value="p.id">Page {{ i + 1 }}</option>
          </select>
        </div>
        <div class="line">
          <label>Angle</label>
          <input type="number" v-model.number="it.r">
        </div>
      </template>
    </div>
  </div>
</template>
