<script setup>
import { computed } from 'vue'
import { state } from './store'
import { bounds, strokePath } from './geom'
import { family } from './fonts'

const props = defineProps({ it: Object, anim: String, origin: String })

const list = computed(() => props.it.grp ? state.items.filter(i => i.gid === props.it.gid) : [props.it])

const box = computed(() => {
  const bs = list.value.map(i => bounds(i))
  const l = Math.min(...bs.map(b => b.l))
  const t = Math.min(...bs.map(b => b.t))
  const w = Math.max(1, Math.max(...bs.map(b => b.r)) - l)
  const h = Math.max(1, Math.max(...bs.map(b => b.b)) - t)
  return { l, t, w, h, k: Math.min(34 / w, 34 / h) }
})

const outer = computed(() => ({
  width: box.value.w * box.value.k + 'px',
  height: box.value.h * box.value.k + 'px',
  left: 'calc(50% - ' + box.value.w * box.value.k / 2 + 'px)',
  top: (48 - box.value.h * box.value.k) / 2 + 'px'
}))

const scaled = computed(() => ({
  width: box.value.w + 'px',
  height: box.value.h + 'px',
  transform: 'scale(' + box.value.k + ')'
}))

const moving = computed(() => ({ animation: props.anim, transformOrigin: props.origin || '50% 50%' }))

function pos(i) {
  return {
    left: i.x - box.value.l + 'px',
    top: i.y - box.value.t + 'px',
    width: i.w + 'px',
    height: i.h + 'px',
    transform: 'rotate(' + i.r + 'deg)',
    opacity: (i.opacity ?? 100) / 100
  }
}

function text(i) {
  return {
    color: i.color,
    fontFamily: family(i.font),
    fontSize: i.size + 'px',
    lineHeight: i.lh
  }
}

function shape(i) {
  return { background: i.color, borderRadius: i.type === 'circle' ? '50%' : i.radius + 'px' }
}
</script>

<template>
  <div class="ps" :style="outer">
    <div class="pk" :style="scaled">
      <div class="pa" :style="moving">
        <div v-for="i in list" :key="i.id" class="pt" :style="pos(i)">
          <img v-if="i.type === 'image'" class="pf" :src="i.src">
          <svg v-else-if="i.type === 'stroke'" class="pf" :viewBox="'0 0 ' + i.ow + ' ' + i.oh" preserveAspectRatio="none">
            <path :d="strokePath(i.pts)" fill="none" :stroke="i.color" :stroke-width="i.sw" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div v-else-if="i.type === 'text'" class="pf ptx" :style="text(i)">{{ i.text }}</div>
          <div v-else class="pf" :style="shape(i)"></div>
        </div>
      </div>
    </div>
  </div>
</template>
