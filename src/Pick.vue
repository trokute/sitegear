<script setup>
import { state, addImage, addMedia } from './store'
import { addSound } from './sounds'

function embedUrl(u) {
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return 'https://www.youtube.com/embed/' + m[1]
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? 'https://player.vimeo.com/video/' + m[1] : u
}

function choose(k) {
  const p = state.pending
  state.pending = null
  if (!p) return
  if (k === 'image') addImage(p.src, p.x, p.y)
  else if (k === 'sound' || k === 'bg') addSound(p.name, p.src, k === 'bg')
  else addMedia(k, k === 'frame' ? embedUrl(p.src) : p.src, p.x, p.y)
}
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
