var _h = {}
var _k = {}
var _m = { x: 0, y: 0 }
var _md = 0
var _dg = null
var _t0 = Date.now()
var _vol = 100
var _fx = { pitch: 0, pan: 0 }
var _pl = []
var _bgm = null
var _ctx = null
var _ml = null

function _on(t, f) {
  (_h[t] = _h[t] || []).push(f)
}

function _fire(t) {
  (_h[t] || []).slice().forEach(function (f) {
    f()
  })
}

function _every(t, f) {
  _on('site', function () {
    setInterval(f, t * 1000)
  })
}

function _q(n) {
  return Array.prototype.slice.call(document.querySelectorAll('[data-c="' + n + '"]'))
}

function _L(o) {
  return o || []
}

function _e(o, f) {
  _L(o).forEach(f)
}

function _px(v) {
  return (Number(v) || 0) + 'px'
}

function _leaf(e) {
  return e.firstElementChild
}

function _rot(e) {
  var m = /rotate\((-?[\d.]+)deg\)/.exec(e.style.transform)
  return m ? +m[1] : 0
}

function _page() {
  return document.querySelectorAll('.p')[c]
}

function _items(p) {
  return Array.prototype.filter.call(p.children, function (i) {
    return i.classList.contains('i')
  })
}

function _lay(e, n) {
  var r = _items(e.parentNode).filter(function (i) {
    return i !== e
  })
  var k = Math.max(1, Math.min(r.length + 1, Math.round(Number(n) || 1)))
  e.parentNode.insertBefore(e, r[k - 1] || null)
}

function _layer(o, w) {
  _e(o, function (e) {
    var i = _items(e.parentNode).indexOf(e) + 1
    _lay(e, w === 'front' ? 1e9 : w === 'back' ? 1 : w === 'up' ? i + 1 : i - 1)
  })
}

function _count() {
  return _items(_page()).length
}

function _at(n) {
  var i = _items(_page())[n - 1]
  return i ? [i] : []
}

function _cname(o) {
  var e = _L(o)[0]
  return e ? e.dataset.c || '' : ''
}

function _mid(e) {
  return [parseFloat(e.style.left) + parseFloat(e.style.width) / 2, parseFloat(e.style.top) + parseFloat(e.style.height) / 2]
}

function _cv(p) {
  var v = p.querySelector('canvas.pen')
  if (!v) {
    v = document.createElement('canvas')
    v.className = 'pen'
    v.width = parseFloat(p.style.width)
    v.height = parseFloat(p.style.height)
    v.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none'
    p.insertBefore(v, p.firstChild)
  }
  return v
}

function _trace(e) {
  if (!e._pd) return
  var m = _mid(e)
  var g = _cv(e.closest('.p')).getContext('2d')
  g.strokeStyle = e._pc || '#000000'
  g.lineWidth = e._ps || 2
  g.lineCap = 'round'
  g.beginPath()
  g.moveTo(e._lx, e._ly)
  g.lineTo(m[0], m[1])
  g.stroke()
  e._lx = m[0]
  e._ly = m[1]
}

function _pen(o, on) {
  _e(o, function (e) {
    e._pd = !!on
    if (!on) return
    var m = _mid(e)
    e._lx = m[0]
    e._ly = m[1]
    _trace(e)
  })
}

function _pcol(o, v) {
  _e(o, function (e) {
    e._pc = v
  })
}

function _psize(o, v) {
  _e(o, function (e) {
    e._ps = Number(v) || 1
  })
}

function _penlayer(o, w) {
  var p = _page()
  var e = _L(o)[0]
  while (e && e.parentNode !== p) e = e.parentNode
  if (e) p.insertBefore(_cv(p), w === 'above' ? e.nextSibling : e)
}

function _clear() {
  var p = _page()
  var v = _cv(p)
  v.getContext('2d').clearRect(0, 0, v.width, v.height)
}

function _add(cls, x, y, w, h, inner) {
  var e = document.createElement('div')
  e.className = 'i'
  if (cls) e.dataset.c = cls
  e.style.cssText = 'left:' + _px(x) + ';top:' + _px(y) + ';width:' + _px(w) + ';height:' + _px(h) + ';transform:rotate(0deg)'
  e.appendChild(inner)
  _page().appendChild(e)
  return e
}

function _box(t) {
  var b = document.createElement(t)
  b.className = 'x'
  return b
}

function _rect(cls, x, y, w, h, col, r) {
  var b = _box('div')
  b.style.background = col
  b.style.borderRadius = _px(r)
  _add(cls, x, y, w, h, b)
}

function _circle(cls, x, y, w, h, col) {
  var b = _box('div')
  b.style.background = col
  b.style.borderRadius = '50%'
  _add(cls, x, y, w, h, b)
}

function _newtext(cls, t, x, y, s, f, col) {
  var b = _box('div')
  b.className = 'x t'
  b.style.cssText = "font-family:'" + f + "',sans-serif;font-size:" + _px(s) + ';line-height:1.2;color:' + col
  b.textContent = t
  var e = _add(cls, x, y, 0, 0, b)
  e.style.width = 'auto'
  e.style.height = 'auto'
  e.style.width = e.offsetWidth + 'px'
  e.style.height = e.offsetHeight + 'px'
}

function _img(cls, u, x, y, w) {
  var b = _box('img')
  b.src = u
  var e = _add(cls, x, y, w, w, b)
  b.onload = function () {
    if (b.naturalWidth) e.style.height = _px(w * b.naturalHeight / b.naturalWidth)
  }
}

function _dup(o) {
  _e(o, function (e) {
    e.parentNode.appendChild(e.cloneNode(true))
  })
}

function _del(o) {
  _e(o, function (e) {
    e.remove()
  })
}

function _get(o, p) {
  var e = _L(o)[0]
  if (!e) return 0
  var s = e.style
  if (p === 'layer') return _items(e.parentNode).indexOf(e) + 1
  if (p === 'x') return parseFloat(s.left)
  if (p === 'y') return parseFloat(s.top)
  if (p === 'width') return parseFloat(s.width)
  if (p === 'height') return parseFloat(s.height)
  if (p === 'angle') return _rot(e)
  if (p === 'opacity') return s.opacity === '' ? 100 : Math.round(s.opacity * 100)
  if (p === 'text') return _leaf(e).textContent
  return parseFloat(_leaf(e).style.fontSize) || 0
}

function _set(o, p, v) {
  _e(o, function (e) {
    var s = e.style
    if (p === 'x') s.left = _px(v)
    else if (p === 'y') s.top = _px(v)
    else if (p === 'width') s.width = _px(v)
    else if (p === 'height') s.height = _px(v)
    else if (p === 'angle') s.transform = 'rotate(' + (Number(v) || 0) + 'deg)'
    else if (p === 'opacity') s.opacity = (Number(v) || 0) / 100
    else if (p === 'text') _leaf(e).textContent = v
    else if (p === 'layer') _lay(e, v)
    else _leaf(e).style.fontSize = _px(v)
    _trace(e)
  })
}

function _chg(o, p, d) {
  _e(o, function (e) {
    _set([e], p, _get([e], p) + (Number(d) || 0))
  })
}

function _move(o, x, y) {
  _e(o, function (e) {
    e.style.left = _px(x)
    e.style.top = _px(y)
    _trace(e)
  })
}

function _glide(o, x, y, t) {
  var els = _L(o)
  var s = els.map(function (e) {
    return [parseFloat(e.style.left), parseFloat(e.style.top)]
  })
  var t0 = performance.now()
  return new Promise(function (res) {
    var step = function (now) {
      var k = t > 0 ? Math.min(1, (now - t0) / (t * 1000)) : 1
      els.forEach(function (e, i) {
        _move([e], s[i][0] + (x - s[i][0]) * k, s[i][1] + (y - s[i][1]) * k)
      })
      if (k < 1) requestAnimationFrame(step)
      else res()
    }
    step(t0)
  })
}

function _vis(o, v) {
  _e(o, function (e) {
    e.style.visibility = v ? '' : 'hidden'
  })
}

function _color(o, v) {
  _e(o, function (e) {
    var x = _leaf(e)
    if (x.classList.contains('t')) x.style.color = v
    else if (x.tagName === 'svg') x.querySelector('path').setAttribute('stroke', v)
    else if (x.tagName === 'DIV' && !x.firstElementChild) x.style.background = v
  })
}

function _anim(o, n, t) {
  _e(o, function (e) {
    var x = _leaf(e)
    x.style.animation = 'none'
    void x.offsetWidth
    x.style.animation = 'k-' + n + ' ' + t + 's ease-in-out 1 both'
  })
  return _sleep(t)
}

function _hit(a, b) {
  return _L(a).some(function (u) {
    var r = u.getBoundingClientRect()
    return _L(b).some(function (v) {
      var s = v.getBoundingClientRect()
      return r.left < s.right && r.right > s.left && r.top < s.bottom && r.bottom > s.top
    })
  })
}

function _down(k) {
  return !!_k[k]
}

function _pt() {
  var p = _page()
  var r = p.getBoundingClientRect()
  var s = r.width / p.offsetWidth
  return { x: (_m.x - r.left) / s, y: (_m.y - r.top) / s }
}

function _mouse(a) {
  var p = _pt()
  return Math.round(a === 'x' ? p.x : p.y)
}

function _mdown() {
  return !!_md
}

function _timer() {
  return Math.round((Date.now() - _t0) / 10) / 100
}

function _rtimer() {
  _t0 = Date.now()
}

function _dragmode(o, on) {
  _e(o, function (e) {
    e._dr = !!on
    e.style.touchAction = on ? 'none' : ''
  })
}

function _tgt(t) {
  if (t === 'mouse-pointer') return _pt()
  var e = _q(t)[0]
  if (!e) return null
  var m = _mid(e)
  return { x: m[0], y: m[1] }
}

function _where(t) {
  var p = _page()
  if (t === 'random') return { x: Math.random() * parseFloat(p.style.width), y: Math.random() * parseFloat(p.style.height) }
  return _tgt(t)
}

function _goto(o, t) {
  _e(o, function (e) {
    var g = _where(t)
    if (g) _move([e], g.x - parseFloat(e.style.width) / 2, g.y - parseFloat(e.style.height) / 2)
  })
}

function _glideto(o, s, t) {
  return Promise.all(_L(o).map(function (e) {
    var g = _where(t)
    if (!g) return 0
    return _glide([e], g.x - parseFloat(e.style.width) / 2, g.y - parseFloat(e.style.height) / 2, s)
  }))
}

function _steps(o, n) {
  _e(o, function (e) {
    var a = _rot(e) * Math.PI / 180
    _move([e], parseFloat(e.style.left) + n * Math.sin(a), parseFloat(e.style.top) - n * Math.cos(a))
  })
}

function _towards(o, t) {
  _e(o, function (e) {
    var g = _where(t)
    if (!g) return
    var m = _mid(e)
    _set([e], 'angle', Math.round(Math.atan2(g.x - m[0], m[1] - g.y) * 1800 / Math.PI) / 10)
  })
}

function _bounce(o) {
  _e(o, function (e) {
    var p = _page()
    var W = parseFloat(p.style.width)
    var H = parseFloat(p.style.height)
    var w = parseFloat(e.style.width)
    var h = parseFloat(e.style.height)
    var x = parseFloat(e.style.left)
    var y = parseFloat(e.style.top)
    var a = _rot(e)
    var hit = false
    if (x < 0 || x + w > W) {
      x = Math.max(0, Math.min(W - w, x))
      a = -a
      hit = true
    }
    if (y < 0 || y + h > H) {
      y = Math.max(0, Math.min(H - h, y))
      a = 180 - a
      hit = true
    }
    if (!hit) return
    e.style.transform = 'rotate(' + (((a + 180) % 360 + 360) % 360 - 180) + 'deg)'
    _move([e], x, y)
  })
}

function _dist(o, t) {
  var e = _L(o)[0]
  var g = _tgt(t)
  if (!e || !g) return 0
  var m = _mid(e)
  return Math.round(Math.hypot(g.x - m[0], g.y - m[1]) * 100) / 100
}

function _touch(o, t) {
  if (t === 'edge') {
    return _L(o).some(function (e) {
      var p = _page()
      var x = parseFloat(e.style.left)
      var y = parseFloat(e.style.top)
      return x < 0 || y < 0 || x + parseFloat(e.style.width) > parseFloat(p.style.width) || y + parseFloat(e.style.height) > parseFloat(p.style.height)
    })
  }
  if (t === 'mouse-pointer') {
    return _L(o).some(function (e) {
      var r = e.getBoundingClientRect()
      return _m.x >= r.left && _m.x <= r.right && _m.y >= r.top && _m.y <= r.bottom
    })
  }
  return _hit(o, _q(t))
}

function _loud() {
  if (!_ml) {
    _ml = { v: 0 }
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        var x = new (window.AudioContext || window.webkitAudioContext)()
        var n = x.createAnalyser()
        var d = new Uint8Array(n.fftSize)
        x.createMediaStreamSource(s).connect(n)
        setInterval(function () {
          n.getByteTimeDomainData(d)
          var m = 0
          for (var i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i] - 128))
          _ml.v = Math.round(m / 1.28)
        }, 50)
      }).catch(function () {})
    }
  }
  return _ml.v
}

function _frame() {
  return new Promise(function (r) {
    requestAnimationFrame(function () {
      r()
    })
  })
}

function _sleep(s) {
  return new Promise(function (r) {
    setTimeout(r, (Number(s) || 0) * 1000)
  })
}

function _lim(v, a, b) {
  return Math.max(a, Math.min(b, Number(v) || 0))
}

function _tune(a) {
  a.volume = _lim(_vol / 100, 0, 1)
  a.preservesPitch = a.mozPreservesPitch = a.webkitPreservesPitch = false
  a.playbackRate = Math.pow(2, _fx.pitch / 120)
}

function _tuneAll() {
  _pl.forEach(_tune)
  if (_bgm) _bgm.volume = _lim(_BG.v / 100 * _vol / 100, 0, 1)
}

function _route(a) {
  try {
    var x = _ctx || (_ctx = new (window.AudioContext || window.webkitAudioContext)())
    var p = x.createStereoPanner()
    p.pan.value = _fx.pan / 100
    x.createMediaElementSource(a).connect(p)
    p.connect(x.destination)
  } catch (e) {}
}

function _play(u) {
  return new Promise(function (res) {
    var a = new Audio()
    if (_fx.pan) a.crossOrigin = 'anonymous'
    a.src = u
    _tune(a)
    if (_fx.pan) _route(a)
    a._r = res
    _pl.push(a)
    var end = function () {
      var i = _pl.indexOf(a)
      if (i < 0) return
      _pl.splice(i, 1)
      res()
    }
    a.onended = end
    a.onerror = end
    var p = a.play()
    if (p && p.catch) p.catch(end)
  })
}

function _snd(n) {
  return _S[n] ? _play(_S[n]) : Promise.resolve()
}

function _stopall() {
  _pl.splice(0).forEach(function (a) {
    a.onended = a.onerror = null
    a.pause()
    a._r()
  })
}

function _fxset(k, v) {
  _fx[k] = k === 'pitch' ? _lim(v, -360, 360) : _lim(v, -100, 100)
  _tuneAll()
}

function _fxchg(k, d) {
  _fxset(k, _fx[k] + (Number(d) || 0))
}

function _fxclear() {
  _fx.pitch = 0
  _fx.pan = 0
  _tuneAll()
}

function _vset(v) {
  _vol = _lim(v, 0, 100)
  _tuneAll()
}

function _vchg(d) {
  _vset(_vol + (Number(d) || 0))
}

function _bgvol(v) {
  if (!_BG) return
  _BG.v = _lim(v, 0, 100)
  _tuneAll()
}

function _startbg() {
  if (!_BG || !_S[_BG.n]) return
  _bgm = new Audio(_S[_BG.n])
  _bgm.loop = true
  _tuneAll()
  var kick = function () {
    removeEventListener('pointerdown', kick, true)
    removeEventListener('keydown', kick, true)
    _bgm.play().catch(function () {})
  }
  var r = _bgm.play()
  if (r && r.catch) {
    r.catch(function () {
      addEventListener('pointerdown', kick, true)
      addEventListener('keydown', kick, true)
    })
  }
}

function _go(n) {
  show(n - 1)
}

function _nav(d) {
  show(c + d)
}

function _link(u) {
  window.open(u, '_blank')
}

function _chain(n) {
  var r = []
  var i = n && n.closest ? n.closest('.i') : null
  while (i) {
    if (i.dataset.c) r.push(i)
    i = i.parentElement ? i.parentElement.closest('.i') : null
  }
  return r
}

function _hook(d, t, e) {
  var o = e.relatedTarget === undefined ? [] : _chain(e.relatedTarget)
  _chain(e.target).forEach(function (i) {
    if (!d || o.indexOf(i) < 0) _fire(t + ':' + i.dataset.c)
  })
}

function _key(e) {
  return e.key.length === 1 ? e.key.toLowerCase() : e.key
}

;['click', 'down', 'up'].forEach(function (t) {
  document.addEventListener(t === 'click' ? 'click' : 'pointer' + t, function (e) {
    _hook(false, t, { target: e.target })
  })
})

document.addEventListener('mouseover', function (e) {
  _hook(true, 'in', e)
})

document.addEventListener('mouseout', function (e) {
  _hook(true, 'out', e)
})

document.addEventListener('pointerdown', function (e) {
  _md = 1
  _m.x = e.clientX
  _m.y = e.clientY
  var i = _chain(e.target).filter(function (n) {
    return n._dr
  })[0]
  if (!i) return
  var p = _pt()
  _dg = { e: i, x: p.x - parseFloat(i.style.left), y: p.y - parseFloat(i.style.top) }
})

document.addEventListener('pointerup', function () {
  _md = 0
  _dg = null
})

addEventListener('pointermove', function (e) {
  _m.x = e.clientX
  _m.y = e.clientY
  if (!_dg) return
  var p = _pt()
  _move([_dg.e], p.x - _dg.x, p.y - _dg.y)
})

addEventListener('keydown', function (e) {
  var k = _key(e)
  _k[k] = 1
  if (_h['press:' + k] || _h['hold:' + k]) e.preventDefault()
  if (!e.repeat) _fire('press:' + k)
  _fire('hold:' + k)
})

addEventListener('keyup', function (e) {
  var k = _key(e)
  _k[k] = 0
  _fire('release:' + k)
})

var _show = show

show = function (i) {
  var p = c
  _show(i)
  if (c !== p) _fire('page:' + (c + 1))
}

function _start() {
  _startbg()
  _fire('site')
  _fire('page:' + (c + 1))
}
