<script setup>
import { state } from './store'
import { choose } from './media'
</script>

<template>
  <div v-if="state.pending" class="panel fixed pick">
    <div class="head">
      <span>Add as</span>
    </div>
    <div class="body">
      <div class="line lname">{{ state.pending.name }}</div>
      <div class="line">
        <button v-for="o in state.pending.opts" :key="o[0]" class="tb" @click="choose(o[0])">{{ o[1] }}</button>
        <button class="tb" @click="state.pending = null">Cancel</button>
      </div>
    </div>
  </div>
</template>
