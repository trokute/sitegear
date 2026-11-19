<script setup>
import { state } from './store'
import Icon from './Icon.vue'
</script>

<template>
  <div v-if="state.error" class="panel fixed fail">
    <div class="head">
      <span>{{ state.error }}</span>
      <Icon class="push" title="Close" :n="25" :s="28" @click="state.error = ''" />
    </div>
  </div>
</template>
