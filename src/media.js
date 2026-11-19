import { state } from './store'

const vid = /\.(mp4|webm|ogv|mov|m4v)$/i
const aud = /\.(mp3|wav|ogg|oga|m4a|aac|flac)$/i

const table = {
  audio: [['audio', 'Audio player'], ['sound', 'Sound'], ['bg', 'Background']],
  video: [['video', 'Video player'], ['audio', 'Audio player']],
  '': [['frame', 'Embed'], ['video', 'Video player'], ['audio', 'Audio player'], ['image', 'Image']]
}

export function offer(src, name, mime, x, y) {
  const s = (src || '').trim()
  if (!s) return
  const p = s.split(/[?#]/)[0]
  const k = mime ? mime.split('/')[0] : aud.test(p) ? 'audio' : vid.test(p) ? 'video' : ''
  state.pending = { src: s, name: name || p.split('/').pop() || s, opts: table[k] || table[''], x, y }
}

export function dropFile(f, x, y) {
  const r = new FileReader()
  r.onload = () => offer(r.result, f.name, f.type, x, y)
  r.readAsDataURL(f)
}
