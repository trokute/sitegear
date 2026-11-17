<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { state, gitem } from './store'
import { animVars } from './anim'
import Item from './Item.vue'

const props = defineProps({ gid: Number, items: Array })

const fx = ref(null)
const gi = computed(() => gitem(props.gid))
const vars = computed(() => animVars(gi.value))
const keysOn = computed(() => !!(gi.value.anim.name === 'keys' && gi.value.keys))
const op = computed(() => gi.value.opacity / 100)
const fxs = computed(() => ({ ...(vars.value || {}), ...(keysOn.value ? { opacity: op.value } : {}) }))

const style = computed(() => ({
  left: gi.value.x + 'px',
  top: gi.value.y + 'px',
  width: gi.value.w + 'px',
  height: gi.value.h + 'px'
}))

const inner = computed(() => ({ left: -gi.value.x + 'px', top: -gi.value.y + 'px', opacity: keysOn.value ? 1 : op.value }))

function restart() {
  const el = fx.value
  if (!el || !vars.value) return
  el.classList.remove('on')
  void el.offsetWidth
  el.classList.add('on')
}

function done() {
  if (fx.value) fx.value.classList.remove('on')
}

watch(() => state.play, p => {
  if (p && p.id === 'g' + props.gid) nextTick(restart)
})
</script>

<template>
  <div class="grp" :style="style">
    <div ref="fx" class="fx" :style="fxs" @animationend.self="done">
      <div class="gin" :style="inner">
        <Item v-for="it in items" :key="it.id" :item="it" />
      </div>
    </div>
  </div>
</template>
