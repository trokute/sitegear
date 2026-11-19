import { state } from './store'

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

export function addFiles(files, bg) {
  for (const f of files) {
    if (!f.type.startsWith('audio/')) continue
    const r = new FileReader()
    r.onload = () => addSound(f.name, r.result, bg)
    r.readAsDataURL(f)
    if (bg) return
  }
}
