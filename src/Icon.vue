<script setup>
import { computed } from 'vue'

const props = defineProps({ n: Number, s: { type: Number, default: 36 } })

const style = computed(() => {
  const i = props.n - 1
  return {
    width: props.s + 'px',
    height: props.s + 'px',
    backgroundSize: props.s * 5 + 'px ' + props.s * 5 + 'px',
    backgroundPosition: -(i % 5) * props.s + 'px ' + -Math.floor(i / 5) * props.s + 'px'
  }
})
</script>

<template>
  <button class="ic" :style="style"></button>
</template>
