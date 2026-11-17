<script setup>
import { computed, ref } from 'vue'
import { state, selIds } from './store'

const open = ref(true)
const from = ref(-1)
const rows = computed(() => [...state.items].reverse())

const names = { image: 'Image', rect: 'Rectangle', circle: 'Circle', stroke: 'Stroke' }
const tags = { text: 'T', image: 'Img', rect: 'R', circle: 'C', stroke: 'P' }

function label(it) {
  return it.type === 'text' ? it.text.slice(0, 12) : names[it.type]
}

function drop(d) {
  if (from.value < 0) return
  const last = state.items.length - 1
  const [it] = state.items.splice(last - from.value, 1)
  state.items.splice(last - d, 0, it)
  from.value = -1
}
</script>

<template>
  <div class="panel fixed layers">
    <div class="head" @click="open = !open">Layers</div>
    <div v-if="open" class="list">
      <div v-for="(it, d) in rows" :key="it.id" class="row" :class="{ on: selIds().includes(it.id) }" draggable="true" @click="state.sel = it.id" @dragstart="from = d" @dragover.prevent @drop="drop(d)">
        <span class="bar"></span>
        <span class="lname">{{ label(it) }}</span>
        <span>{{ tags[it.type] }}</span>
      </div>
    </div>
  </div>
</template>
