import { state, gitem } from './store'
import { presets, kfRule, freeCss, keysCss, animVars, closeKeys } from './anim'
import { googleSet, googleUrl } from './fonts'
import { strokePath } from './geom'
import runtime from './runtime.js?raw'
import mount from './widgets'

const cache = new Map()

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function grab(src) {
  try {
    const blob = await (await fetch(src)).blob()
    return await new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result)
      r.onerror = rej
      r.readAsDataURL(blob)
    })
  } catch (e) {
    return src
  }
}

async function embed(src) {
  if (src.startsWith('data:')) return src
  if (!cache.has(src)) cache.set(src, await grab(src))
  return cache.get(src)
}

async function build() {
  closeKeys()
  let code = ''
  if (state.script && state.script.blocks) {
    const b = await import('./blocks')
    code = b.compile(state.script).trim()
  }
  const bg = state.sounds.find(s => s.name === state.audio.bg)
  const snd = {}
  for (const s of state.sounds) {
    if (s.name === state.audio.bg || code.includes(JSON.stringify(s.name))) snd[s.name] = await embed(s.src)
  }
  const idx = new Map(state.pages.map((p, i) => [p.id, i]))
  const pages = []
  const names = new Set()
  const used = new Set()
  let free = ''
  let wg = false
  for (const p of state.pages) {
    const parts = []
    const one = async (it, ox, oy, grouped) => {
      let go = ''
      if (it.link === 'next' || it.link === 'prev') go = it.link
      else if (idx.has(it.link)) go = idx.get(it.link)
      const cls = go === '' ? 'i' : 'i g'
      const att = (go === '' ? '' : ' data-go="' + go + '"') + (it.cls ? ' data-c="' + esc(it.cls) + '"' : '')
      const v = grouped ? null : animVars(it)
      const keys = v && it.anim.name === 'keys'
      const op = (it.opacity ?? 100) / 100
      const pos = 'left:' + (it.x - ox) + 'px;top:' + (it.y - oy) + 'px;width:' + it.w + 'px;height:' + it.h + 'px;transform:rotate(' + it.r + 'deg)' + (op < 1 && !keys ? ';opacity:' + op : '')
      const vars = (v ? Object.entries(v).map(([k, x]) => k + ':' + x).join(';') + ';' : '') + (keys ? 'opacity:' + op + ';' : '')
      const on = v ? ' data-on="' + it.anim.on + '"' : ''
      if (v) {
        if (it.anim.name === 'free') free += freeCss(it)
        else if (keys) free += keysCss(it)
        else used.add(it.anim.name)
      }
      let inner
      if (it.type === 'image') {
        inner = '<img class="x"' + on + ' style="' + vars + '" src="' + esc(await embed(it.src)) + '">'
      } else if (it.type === 'stroke') {
        inner = '<svg class="x"' + on + ' style="' + vars + '" viewBox="0 0 ' + it.ow + ' ' + it.oh + '" preserveAspectRatio="none"><path d="' + strokePath(it.pts) + '" fill="none" stroke="' + esc(it.color) + '" stroke-width="' + it.sw + '" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      } else if (it.type === 'text') {
        names.add(it.font)
        const f = "font-family:'" + esc(it.font) + "',sans-serif;font-size:" + it.size + 'px;line-height:' + it.lh + ';color:' + it.color
        inner = '<div class="x t"' + on + ' style="' + vars + f + '">' + esc(it.text) + '</div>'
      } else if (it.type === 'widget') {
        const cfg = JSON.parse(JSON.stringify(it.cfg))
        for (const k of Object.keys(cfg.img || {})) cfg.img[k] = await embed(cfg.img[k])
        wg = true
        inner = '<div class="x"' + on + ' style="' + vars + '" data-k="' + it.kind + '" data-cfg="' + esc(JSON.stringify(cfg)) + '"></div>'
      } else if (it.type === 'media') {
        const tag = it.kind === 'frame' ? 'iframe' : it.kind
        inner = '<' + tag + ' class="x"' + on + ' style="' + vars + '" src="' + esc(it.src) + '"' + (tag === 'iframe' ? ' referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' : ' controls></' + tag + '>')
      } else {
        const rad = it.type === 'circle' ? '50%' : it.radius + 'px'
        inner = '<div class="x"' + on + ' style="' + vars + 'background:' + it.color + ';border-radius:' + rad + '"></div>'
      }
      return '<div class="' + cls + '"' + att + ' style="' + pos + '">' + inner + '</div>'
    }
    const seen = new Set()
    for (const it of p.items) {
      if (!it.gid) {
        parts.push(await one(it, 0, 0, false))
        continue
      }
      if (seen.has(it.gid)) continue
      seen.add(it.gid)
      const m = p.items.filter(i => i.gid === it.gid)
      const gi = gitem(it.gid, p)
      const a = gi.anim
      const v = animVars(gi)
      const keys = v && a.name === 'keys'
      const op = gi.opacity / 100
      if (v) {
        if (a.name === 'free') free += freeCss(gi)
        else if (keys) free += keysCss(gi)
        else used.add(a.name)
      }
      const on = v ? ' data-on="' + a.on + '"' : ''
      const vars = (v ? Object.entries(v).map(([k, x]) => k + ':' + x).join(';') + ';' : '') + (keys ? 'opacity:' + op + ';' : '')
      const kids = []
      for (const i of m) kids.push(await one(i, gi.x, gi.y, true))
      parts.push('<div class="i"' + (gi.cls ? ' data-c="' + esc(gi.cls) + '"' : '') + ' style="left:' + gi.x + 'px;top:' + gi.y + 'px;width:' + gi.w + 'px;height:' + gi.h + 'px' + (op < 1 && !keys ? ';opacity:' + op : '') + '"><div class="x"' + on + ' style="' + vars + '">' + kids.join('\n') + '</div></div>')
    }
    const show = pages.length === 0 ? 'display:block;' : ''
    pages.push('<div class="p" style="' + show + 'width:' + p.w + 'px;height:' + p.h + 'px;background:' + p.bg + '">\n' + parts.join('\n') + '\n</div>')
  }
  if (wg) names.add('Patrick Hand')
  if (code.includes('_newtext(')) state.fonts.forEach(f => names.add(f.name))
  const hrefs = new Set()
  names.forEach(n => {
    const f = state.fonts.find(x => x.name === n)
    if (f) hrefs.add(f.link)
    else if (googleSet.has(n)) hrefs.add(googleUrl(n))
  })
  const links = [...hrefs].map(h => '<link rel="stylesheet" href="' + esc(h) + '">').join('\n')
  const kf = presets.filter(p => used.has(p[0]) || code.includes('_anim(')).map(kfRule).join('') + free
  const fit = "var ps=document.querySelectorAll('.p'),w=document.getElementById('w'),c=0,seen=[];function play(x){x.classList.remove('on');void x.offsetWidth;x.classList.add('on')}function fit(){var p=ps[c],v=document.documentElement.clientWidth,k=Math.min(1,v/p.offsetWidth);p.style.transform='scale('+k+')';p.style.left=Math.max(0,(v-p.offsetWidth*k)/2)+'px';w.style.height=p.offsetHeight*k+'px'}function enter(){var p=ps[c];p.querySelectorAll('.x[data-on=page]').forEach(play);if(!seen[c]){seen[c]=1;p.querySelectorAll('.x[data-on=site]').forEach(play)}}function show(i){if(i<0||i>=ps.length)return;ps[c].style.display='none';c=i;ps[c].style.display='block';fit();scrollTo(0,0);enter()}document.addEventListener('click',function(e){var i=e.target.closest('.i');if(!i)return;var g=i.dataset.go;for(var j=i;j;j=j.parentElement.closest('.i')){var x=j.querySelector(':scope>.x[data-on=click]');if(x)play(x)}if(g!==undefined)show(g=='next'?c+1:g=='prev'?c-1:+g)});addEventListener('resize',fit);fit();enter()"
  const css = 'html,body{margin:0;background:' + state.backdrop + '}#w{position:relative;width:100%;overflow:hidden}.p{position:absolute;top:0;left:0;display:none;overflow:hidden;transform-origin:0 0}.i{position:absolute}.x{width:100%;height:100%;transform-origin:var(--o,50% 50%)}img.x,svg.x,video.x,audio.x,iframe.x{display:block;overflow:visible}iframe.x{border:0}.t{white-space:pre-wrap;overflow-wrap:break-word}.g{cursor:pointer}.x[data-on=loop]{animation:var(--a) var(--d) var(--e) infinite}.i:hover>.x[data-on=hover]{animation:var(--a) var(--d) var(--e) infinite}.x.on{animation:var(--a) var(--d) var(--e) 1 both}' + kf
  const data = '<script>var _S=' + JSON.stringify(snd).replace(/</g, '\\u003c') + ';var _BG=' + (bg ? JSON.stringify({ n: bg.name, v: state.audio.vol }) : 'null') + '</script>\n'
  const run = code || bg ? data + '<script>' + runtime + '</script>\n<script>(function () {\n' + code.replace(/<\//g, '<\\/') + '\n})()\n_start()</script>\n' : ''
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Site</title>\n' + links +
    '\n<style>' + css + '</style>\n</head>\n<body>\n<div id="w">\n' +
    pages.join('\n') + '\n</div>\n<script>' + fit + '</script>\n' + (wg ? '<script>var m=' + mount + ';document.querySelectorAll("[data-k]").forEach(function(e){m(e,e.dataset.k,JSON.parse(e.dataset.cfg))})</script>\n' : '') + run + '</body>\n</html>\n'
}

function wrap(html) {
  const data = JSON.stringify(html).replace(/</g, '\\u003c')
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title><style>body{margin:0;font:16px sans-serif;background:#eee}#bar{padding:8px;background:#d9d9d9}button{margin-right:6px;font:inherit}iframe{display:block;border:1px solid #999;background:#fff}</style></head><body><div id="bar"><button data-w="100%" data-h="calc(100vh - 50px)">Desktop</button><button data-w="768px" data-h="1024px">Tablet</button><button data-w="412px" data-h="915px">Android</button></div><iframe id="f"></iframe><script>var f=document.getElementById("f");f.srcdoc=' + data + ';function s(b){f.style.width=b.dataset.w;f.style.height=b.dataset.h}var bs=document.querySelectorAll("button");bs.forEach(function(b){b.onclick=function(){s(b)}});s(bs[0])</script></body></html>'
}

export async function preview() {
  const w = window.open('', '_blank')
  const html = await build()
  const url = URL.createObjectURL(new Blob([wrap(html)], { type: 'text/html' }))
  if (w) w.location.href = url
}

export async function download() {
  const html = await build()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
  a.download = 'site.html'
  a.click()
}
