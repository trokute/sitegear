export default function (el, kind, o) {
  if (!document.getElementById('wgs')) {
    const s = document.createElement('style')
    s.id = 'wgs'
    s.textContent = ".wg{display:flex;flex-direction:column;gap:6px;width:100%;height:100%;padding:6px;overflow:hidden;font-family:'Patrick Hand',sans-serif;font-size:18px;line-height:1.2;color:#000;border:1px solid #000;background:rgba(255,255,255,.7)}.wg .wr{flex:1;min-height:0;display:grid;gap:4px}.wg .wc{display:flex;align-items:center;justify-content:center;overflow:hidden;min-width:0;border:1px solid #000;background:#fff 0 0/100% 100% no-repeat;text-transform:uppercase;font-size:1.3em;user-select:none}.wg .ok{background-color:#7b7}.wg .hi{background-color:#db6}.wg .no{background-color:#aaa}.wg .cl{background-color:#ddd;cursor:pointer}.wg .op{background-color:#eee}.wg .ws{min-height:22px}.wg .wb{display:flex;gap:6px;align-items:center}.wg input{flex:1;min-width:0;font:inherit;border:1px solid #aaa;background:#fff;padding:2px 6px}.wg button{font:inherit;border:1px solid #000;background:#fff;padding:1px 8px;cursor:pointer}"
    document.head.appendChild(s)
  }
  const q = (t, k, p) => {
    const e = document.createElement(t)
    if (k) e.className = k
    p.appendChild(e)
    return e
  }
  el.innerHTML = ''
  el.classList.add('wg')
  if (kind === 'wordle') {
    const w = String(o.word || '').toLowerCase().replace(/[^a-z]/g, '') || 'word'
    const m = Math.max(1, Math.min(12, Math.round(o.max) || 6))
    const gr = q('div', 'wr', el)
    gr.style.gridTemplateColumns = 'repeat(' + w.length + ',1fr)'
    gr.style.gridTemplateRows = 'repeat(' + m + ',1fr)'
    const cs = []
    for (let i = 0; i < m * w.length; i++) cs.push(q('div', 'wc', gr))
    const st = q('div', 'ws', el)
    const bar = q('div', 'wb', el)
    const inp = q('input', '', bar)
    const go = q('button', '', bar)
    go.textContent = 'Enter'
    inp.maxLength = w.length
    st.textContent = m + ' guesses'
    let n = 0
    let end = false
    const send = () => {
      const v = inp.value.toLowerCase()
      if (end) return
      if (v.length !== w.length) {
        st.textContent = 'Enter ' + w.length + ' letters'
        return
      }
      const left = {}
      for (let i = 0; i < w.length; i++) if (v[i] !== w[i]) left[w[i]] = (left[w[i]] || 0) + 1
      for (let i = 0; i < w.length; i++) {
        const e = cs[n * w.length + i]
        e.textContent = v[i]
        e.classList.add(v[i] === w[i] ? 'ok' : left[v[i]] > 0 ? (left[v[i]]--, 'hi') : 'no')
      }
      n++
      inp.value = ''
      end = v === w || n >= m
      st.textContent = v === w ? 'You win' : n >= m ? 'The word was ' + w : m - n + ' left'
      inp.disabled = go.disabled = end
    }
    go.onclick = send
    inp.onkeydown = e => {
      if (e.key === 'Enter') send()
    }
    return
  }
  const N = 9
  const tot = N * N
  const mc = Math.max(1, Math.min(Math.round(o.mines) || 10, tot - 1))
  const im = o.custom && o.img ? o.img : {}
  const bar = q('div', 'wb', el)
  const st = q('span', 'ws', bar)
  const rs = q('button', '', bar)
  rs.textContent = 'Reset'
  rs.style.marginLeft = 'auto'
  const gr = q('div', 'wr', el)
  gr.style.gridTemplateColumns = 'repeat(' + N + ',1fr)'
  gr.style.gridTemplateRows = 'repeat(' + N + ',1fr)'
  const cs = []
  for (let i = 0; i < tot; i++) cs.push(q('div', 'wc', gr))
  const txt = { mine: 'X', flag: 'F', tile: '', 0: '' }
  let mine, open, flag, first, over, shown, msg
  const near = i => {
    const r = []
    const x = i % N
    const y = (i - x) / N
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        const u = x + a
        const v = y + b
        if ((a || b) && u >= 0 && v >= 0 && u < N && v < N) r.push(v * N + u)
      }
    }
    return r
  }
  const count = i => near(i).filter(j => mine[j]).length
  const draw = i => {
    const e = cs[i]
    const k = open[i] ? mine[i] ? 'mine' : String(count(i)) : flag[i] ? 'flag' : 'tile'
    e.className = 'wc ' + (open[i] ? 'op' : 'cl')
    e.style.backgroundImage = im[k] ? 'url("' + im[k].replace(/"/g, '%22') + '")' : ''
    e.textContent = im[k] ? '' : txt[k] === undefined ? k : txt[k]
  }
  const info = () => {
    st.textContent = msg || mc - flag.filter(Boolean).length + ' mines'
  }
  const plant = i => {
    const ex = mc <= tot - 9 ? [i, ...near(i)] : [i]
    const ok = [...Array(tot).keys()].filter(j => !ex.includes(j))
    for (let n = 0; n < mc; n++) mine[ok.splice(Math.floor(Math.random() * ok.length), 1)[0]] = true
  }
  const reveal = i => {
    const s = [i]
    while (s.length) {
      const j = s.pop()
      if (open[j] || flag[j]) continue
      open[j] = true
      shown++
      draw(j)
      if (!mine[j] && !count(j)) s.push(...near(j))
    }
  }
  const mark = i => {
    if (over || open[i]) return
    flag[i] = !flag[i]
    draw(i)
    info()
  }
  const reset = () => {
    mine = Array(tot).fill(false)
    open = Array(tot).fill(false)
    flag = Array(tot).fill(false)
    first = true
    over = false
    shown = 0
    msg = ''
    cs.forEach((_, i) => draw(i))
    info()
  }
  cs.forEach((e, i) => {
    e.onclick = ev => {
      if (over) return
      if (ev.shiftKey) return mark(i)
      if (flag[i] || open[i]) return
      if (first) {
        first = false
        plant(i)
      }
      if (mine[i]) {
        over = true
        msg = 'You lost'
        mine.forEach((m, j) => {
          if (m) {
            open[j] = true
            draw(j)
          }
        })
      } else {
        reveal(i)
        if (shown === tot - mc) {
          over = true
          msg = 'You win'
        }
      }
      info()
    }
    e.oncontextmenu = ev => {
      ev.preventDefault()
      mark(i)
    }
  })
  rs.onclick = reset
  reset()
}
