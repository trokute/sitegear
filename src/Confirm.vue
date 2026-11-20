<script setup>
import { state } from './store'

function yes() {
  const a = state.ask
  state.ask = null
  a.yes()
}
</script>

<template>
  <div v-if="state.ask" class="panel fixed confirm">
    <div class="head">
      <span>Confirm</span>
    </div>
    <div class="body">
      <div class="line">{{ state.ask.msg }}</div>
      <div class="line">
        <button class="tb" @click="yes">Ok</button>
        <button class="tb" @click="state.ask = null">Cancel</button>
      </div>
    </div>
  </div>
</template>
