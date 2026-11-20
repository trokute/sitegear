export function drag(e, p) {
  if (e.target.closest('button')) return
  const sx = e.clientX - p.x
  const sy = e.clientY - p.y
  const t = e.currentTarget
  t.setPointerCapture(e.pointerId)
  const move = ev => {
    p.x = Math.max(0, ev.clientX - sx)
    p.y = Math.max(0, ev.clientY - sy)
  }
  t.addEventListener('pointermove', move)
  t.addEventListener('pointerup', () => t.removeEventListener('pointermove', move), { once: true })
}
