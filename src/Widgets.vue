<script setup>
import { state, addWidget } from './store'
import Icon from './Icon.vue'

const list = [
  { k: 'wordle', n: 'Wordle' },
  { k: 'mines', n: 'Minesweeper' }
]
</script>

<template>
  <div class="panel fixed widgets">
    <div class="head">
      <span>Widgets</span>
      <Icon class="push" title="Close" :n="25" :s="28" @click="state.widgets = false" />
    </div>
    <div class="body">
      <div v-for="w in list" :key="w.k" class="line">
        <span class="lname">{{ w.n }}</span>
        <button class="tb" @click="addWidget(w.k)">Add</button>
      </div>
    </div>
  </div>
</template>
