<script setup>
import { state } from './store'
import { ic } from './icon'
</script>

<template>
  <div v-if="state.error" class="panel fixed fail">
    <div class="head">
      <span>{{ state.error }}</span>
      <button class="ic push" title="Close" :style="ic(25, 28)" @click="state.error = ''"></button>
    </div>
  </div>
</template>
