export function bounds(it, x = it.x, y = it.y) {
  const a = it.r * Math.PI / 180
  const c = Math.abs(Math.cos(a))
  const s = Math.abs(Math.sin(a))
  const w = it.w * c + it.h * s
  const h = it.w * s + it.h * c
  const cx = x + it.w / 2
  const cy = y + it.h / 2
  return { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2, cx, cy, w, h }
}

export function strokePath(pts) {
  if (pts.length === 1) return 'M' + pts[0][0] + ' ' + pts[0][1] + 'l0.01 0'
  let d = 'M' + pts[0][0] + ' ' + pts[0][1]
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    d += 'Q' + pts[i][0] + ' ' + pts[i][1] + ' ' + mx + ' ' + my
  }
  const l = pts[pts.length - 1]
  return d + 'L' + l[0] + ' ' + l[1]
}

function best(feats, lines, t) {
  let r = null
  for (const f of feats) {
    for (const l of lines) {
      const d = l - f
      if (Math.abs(d) <= t && (!r || Math.abs(d) < Math.abs(r.d))) r = { d, line: l }
    }
  }
  return r
}

export function snapMove(it, x, y, items, w, h, t) {
  const b = bounds(it, x, y)
  const xs = [0, w / 2, w]
  const ys = [0, h / 2, h]
  for (const o of items) {
    if (o.id === it.id) continue
    const p = bounds(o)
    xs.push(p.l, p.cx, p.r)
    ys.push(p.t, p.cy, p.b)
  }
  const fx = best([b.l, b.cx, b.r], xs, t)
  const fy = best([b.t, b.cy, b.b], ys, t)
  const guides = []
  if (fx) guides.push({ v: true, p: fx.line })
  if (fy) guides.push({ v: false, p: fy.line })
  return { x: x + (fx ? fx.d : 0), y: y + (fy ? fy.d : 0), guides }
}
