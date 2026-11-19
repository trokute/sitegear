<script setup>
import { state, addWidget } from './store'
import { ic } from './icon'

const list = [
  { k: 'wordle', n: 'Wordle' },
  { k: 'mines', n: 'Minesweeper' }
]
</script>

<template>
  <div class="panel fixed widgets">
    <div class="head">
      <span>Widgets</span>
      <button class="ic push" title="Close" :style="ic(25, 28)" @click="state.widgets = false"></button>
    </div>
    <div class="body">
      <div v-for="w in list" :key="w.k" class="line">
        <span class="lname">{{ w.n }}</span>
        <button class="tb" @click="addWidget(w.k)">Add</button>
      </div>
    </div>
  </div>
</template>
