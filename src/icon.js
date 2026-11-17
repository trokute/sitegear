export function ic(n, s = 36) {
  const i = n - 1
  return {
    width: s + 'px',
    height: s + 'px',
    backgroundSize: s * 5 + 'px ' + s * 5 + 'px',
    backgroundPosition: -(i % 5) * s + 'px ' + -Math.floor(i / 5) * s + 'px'
  }
}
