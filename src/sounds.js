import { state, fail } from './store'

let cur = null

function clean(s) {
  return s.replace(/\.[^.]*$/, '').replace(/[^\w-]/g, '') || 'sound'
}

export function addSound(raw, src, bg) {
  const base = clean(raw)
  let name = base
  let k = 1
  while (state.sounds.some(s => s.name === name)) name = base + ++k
  state.sounds.push({ name, src })
  if (bg) state.audio.bg = name
}

export function addLink(link, bg) {
  const u = (link || '').trim()
  if (!u) return
  addSound(u.split(/[?#]/)[0].split('/').pop(), u, bg)
}

export function addFiles(files, bg) {
  for (const f of files) {
    if (!f.type.startsWith('audio/')) continue
    const r = new FileReader()
    r.onload = () => addSound(f.name, r.result, bg)
    r.readAsDataURL(f)
    if (bg) return
  }
}

export function removeSound(i) {
  const [s] = state.sounds.splice(i, 1)
  if (s && state.audio.bg === s.name) state.audio.bg = ''
}

export function preview(s) {
  if (cur) cur.pause()
  cur = new Audio(s.src)
  cur.volume = state.audio.vol / 100
  cur.play().catch(() => fail('Sound failed to play'))
}
