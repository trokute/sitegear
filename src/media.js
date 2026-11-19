import { state, addImage, addMedia } from './store'
import { addSound } from './sounds'

const vid = /\.(mp4|webm|ogv|mov|m4v)$/i
const aud = /\.(mp3|wav|ogg|oga|m4a|aac|flac)$/i

const table = {
  audio: [['audio', 'Audio player'], ['sound', 'Sound'], ['bg', 'Background']],
  video: [['video', 'Video player'], ['audio', 'Audio player']],
  '': [['frame', 'Embed'], ['video', 'Video player'], ['audio', 'Audio player'], ['image', 'Image']]
}

export function embedUrl(u) {
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)
  if (m) return 'https://www.youtube.com/embed/' + m[1]
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m ? 'https://player.vimeo.com/video/' + m[1] : u
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

export function choose(k) {
  const p = state.pending
  state.pending = null
  if (!p) return
  if (k === 'image') addImage(p.src, p.x, p.y)
  else if (k === 'sound' || k === 'bg') addSound(p.name, p.src, k === 'bg')
  else addMedia(k, k === 'frame' ? embedUrl(p.src) : p.src, p.x, p.y)
}
