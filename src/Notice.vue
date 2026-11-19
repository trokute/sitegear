<script setup>
import { computed, ref } from 'vue'
import { state } from './store'
import Icon from './Icon.vue'
import readme from '../README.md?raw'

const open = ref(localStorage.getItem('readme') !== readme)

const lines = computed(() => readme.split('\n').filter(l => l.trim()).map(l => {
  const m = l.match(/^(#+|-|\*)\s+(.*)$/)
  if (!m) return { t: 'p', s: l }
  return m[1][0] === '#' ? { t: 'h4', s: m[2] } : { t: 'li', s: m[2] }
}))

function close() {
  localStorage.setItem('readme', readme)
  open.value = false
}
</script>

<template>
  <div v-if="open" class="panel fixed notice">
    <div class="head">
      <span>Notice</span>
      <button class="tb" @click="state.help = !state.help">Help</button>
      <Icon class="push" title="Close" :n="25" :s="28" @click="close" />
    </div>
    <div class="body">
      <template v-for="(l, i) in lines" :key="i">
        <h4 v-if="l.t === 'h4'">{{ l.s }}</h4>
        <div v-else class="line">{{ l.t === 'li' ? '- ' + l.s : l.s }}</div>
      </template>
    </div>
  </div>
</template>
