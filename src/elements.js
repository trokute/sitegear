var _els = new WeakMap()
var _ev = { click: 'click', down: 'pointerdown', up: 'pointerup', enter: 'mouseenter', leave: 'mouseleave' }

function _El(node) {
  this.node = node
}

function _num(v) {
  return parseFloat(v) || 0
}

function _pos(t) {
  if (t === 'mouse') return _pt()
  if (t instanceof _El) {
    var m = _mid(t.node)
    return { x: m[0], y: m[1] }
  }
  return t
}

function _prop(name, get, set) {
  Object.defineProperty(_El.prototype, name, { get: get, set: set, enumerable: true })
}

function _kind(e) {
  var l = _leaf(e)
  if (l.dataset.k) return 'widget'
  if (l.firstElementChild && l.firstElementChild.classList.contains('i')) return 'group'
  if (l.tagName === 'IMG') return 'image'
  if (l.tagName === 'svg') return 'stroke'
  if (/^(IFRAME|VIDEO|AUDIO)$/.test(l.tagName)) return 'media'
  if (l.classList.contains('t')) return 'text'
  return l.style.borderRadius === '50%' ? 'circle' : 'rect'
}

;[['x', 'left'], ['y', 'top'], ['width', 'width'], ['height', 'height']].forEach(function (k) {
  _prop(k[0], function () {
    return _num(this.node.style[k[1]])
  }, function (v) {
    this.node.style[k[1]] = _px(v)
    _trace(this.node)
  })
})

_prop('angle', function () {
  return _rot(this.node)
}, function (v) {
  this.node.style.transform = 'rotate(' + (Number(v) || 0) + 'deg)'
  _trace(this.node)
})

_prop('opacity', function () {
  var o = this.node.style.opacity
  return o === '' ? 100 : Math.round(o * 100)
}, function (v) {
  this.node.style.opacity = (Number(v) || 0) / 100
})

_prop('visible', function () {
  return this.node.style.visibility !== 'hidden'
}, function (v) {
  this.node.style.visibility = v ? '' : 'hidden'
})

_prop('draggable', function () {
  return !!this.node._dr
}, function (v) {
  _dragmode([this.node], v)
})

_prop('layer', function () {
  return _items(this.node.parentNode).indexOf(this.node) + 1
}, function (v) {
  _lay(this.node, v)
})

_prop('name', function () {
  return this.node.dataset.c || ''
}, function (v) {
  if (v) this.node.dataset.c = v
  else delete this.node.dataset.c
})

_prop('type', function () {
  return _kind(this.node)
})

_prop('page', function () {
  return Array.prototype.indexOf.call(document.querySelectorAll('.p'), this.node.closest('.p')) + 1
})

_prop('link', function () {
  var g = this.node.dataset.go
  if (g === undefined) return ''
  return isNaN(g) ? g : +g + 1
}, function (v) {
  if (v === '' || v === null || v === undefined) {
    delete this.node.dataset.go
    this.node.classList.remove('g')
    return
  }
  this.node.dataset.go = typeof v === 'number' ? v - 1 : v
  this.node.classList.add('g')
})

_prop('leaf', function () {
  return _leaf(this.node)
})

_prop('text', function () {
  return _kind(this.node) === 'text' ? _leaf(this.node).textContent : ''
}, function (v) {
  if (_kind(this.node) === 'text') _leaf(this.node).textContent = v
})

_prop('font', function () {
  return _leaf(this.node).style.fontFamily.split(',')[0].replace(/["']/g, '')
}, function (v) {
  _leaf(this.node).style.fontFamily = /^(sans-serif|serif|monospace)$/.test(v) ? v : "'" + v + "',sans-serif"
})

_prop('size', function () {
  return _num(_leaf(this.node).style.fontSize)
}, function (v) {
  _leaf(this.node).style.fontSize = _px(v)
})

_prop('lineHeight', function () {
  return _num(_leaf(this.node).style.lineHeight)
}, function (v) {
  _leaf(this.node).style.lineHeight = v
})

_prop('color', function () {
  var l = _leaf(this.node)
  var k = _kind(this.node)
  if (k === 'text') return l.style.color
  if (k === 'stroke') return l.querySelector('path').getAttribute('stroke')
  return l.style.background
}, function (v) {
  _color([this.node], v)
})

_prop('radius', function () {
  return _num(_leaf(this.node).style.borderRadius)
}, function (v) {
  if (_kind(this.node) === 'rect') _leaf(this.node).style.borderRadius = _px(v)
})

_prop('strokeWidth', function () {
  var p = _leaf(this.node).querySelector('path')
  return p ? _num(p.getAttribute('stroke-width')) : 0
}, function (v) {
  var p = _leaf(this.node).querySelector('path')
  if (p) p.setAttribute('stroke-width', v)
})

_prop('src', function () {
  return _leaf(this.node).getAttribute('src') || ''
}, function (v) {
  if (/^(IMG|IFRAME|VIDEO|AUDIO)$/.test(_leaf(this.node).tagName)) _leaf(this.node).src = v
})

_El.prototype.moveTo = function (x, y) {
  _move([this.node], x, y)
  return this
}

_El.prototype.forward = function (n) {
  _steps([this.node], n)
  return this
}

_El.prototype.glide = function (x, y, secs) {
  return _glide([this.node], x, y, secs)
}

_El.prototype.lookAt = function (t) {
  var g = _pos(t)
  var m = _mid(this.node)
  this.angle = Math.round(Math.atan2(g.x - m[0], m[1] - g.y) * 1800 / Math.PI) / 10
  return this
}

_El.prototype.distanceTo = function (t) {
  var g = _pos(t)
  var m = _mid(this.node)
  return Math.round(Math.hypot(g.x - m[0], g.y - m[1]) * 100) / 100
}

_El.prototype.touching = function (t) {
  if (t === 'mouse') return _touch([this.node], 'mouse-pointer')
  if (t === 'edge') return _touch([this.node], 'edge')
  return _hit([this.node], _L(t))
}

_El.prototype.bounce = function () {
  _bounce([this.node])
  return this
}

_El.prototype.front = function () {
  _layer([this.node], 'front')
  return this
}

_El.prototype.back = function () {
  _layer([this.node], 'back')
  return this
}

_El.prototype.play = function (name, secs) {
  return _anim([this.node], name, secs === undefined ? 1 : secs)
}

_El.prototype.loop = function (name, secs) {
  var l = _leaf(this.node)
  l.style.animation = 'none'
  void l.offsetWidth
  l.style.animation = 'k-' + name + ' ' + (secs === undefined ? 1 : secs) + 's ease-in-out infinite'
  return this
}

_El.prototype.stop = function () {
  _leaf(this.node).style.animation = 'none'
  return this
}

_El.prototype.clone = function () {
  var n = this.node.cloneNode(true)
  delete n.dataset.s
  n.querySelectorAll('[data-s]').forEach(function (i) {
    delete i.dataset.s
  })
  delete n.dataset.c
  n.querySelectorAll('[data-c]').forEach(function (i) {
    delete i.dataset.c
  })
  this.node.parentNode.appendChild(n)
  return sg.el(n)
}

_El.prototype.remove = function () {
  this.node.remove()
}

_El.prototype.on = function (t, f) {
  var me = this
  var w = function (e) {
    return f.call(me, e)
  }
  w.t = t
  w.f = f
  w.live = true
  ;(me._l = me._l || []).push(w)
  if (t === 'frame') {
    var loop = function () {
      if (!w.live || !me.node.isConnected) return
      w()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  } else {
    me.node.addEventListener(_ev[t], w)
  }
  return me
}

_El.prototype.off = function (t, f) {
  var me = this
  me._l = (me._l || []).filter(function (w) {
    if (w.t !== t || (f && w.f !== f)) return true
    w.live = false
    if (t !== 'frame') me.node.removeEventListener(_ev[t], w)
    return false
  })
  return me
}

sg.el = function (n) {
  var e = _els.get(n)
  if (!e) {
    e = new _El(n)
    _els.set(n, e)
  }
  return e
}

sg.find = function (name) {
  var n = document.querySelector('[data-c="' + name + '"]')
  return n ? sg.el(n) : null
}

sg.create = function (type, p) {
  p = p || {}
  var n
  if (type === 'rect') n = _rect(p.name, 0, 0, 100, 100, '#cccccc', 0)
  else if (type === 'circle') n = _circle(p.name, 0, 0, 100, 100, '#cccccc')
  else if (type === 'text') n = _newtext(p.name, p.text || 'Text', 0, 0, p.size || 32, p.font || 'sans-serif', p.color || '#000000')
  else if (type === 'image') n = _img(p.name, p.src || '', 0, 0, p.width || 200)
  else throw new Error('Unknown type ' + type)
  var e = sg.el(n)
  for (var k in p) if (k !== 'name') e[k] = p[k]
  return e
}

sg.run = function (k, f) {
  var n = document.querySelector('[data-s="' + k + '"]')
  if (n) f.call(sg.el(n))
}

sg.next = function () {
  _nav(1)
}

sg.prev = function () {
  _nav(-1)
}

sg.keyDown = _down
sg.resetTime = _rtimer
sg.sound = _snd
sg.playUrl = _play
sg.stopSounds = _stopall
sg.bgVolume = _bgvol
sg.loudness = _loud

Object.defineProperties(sg, {
  mouseX: { get: function () { return _mouse('x') } },
  mouseY: { get: function () { return _mouse('y') } },
  mouseDown: { get: _mdown },
  time: { get: _timer },
  page: { get: function () { return c + 1 }, set: _go },
  pageCount: { get: function () { return document.querySelectorAll('.p').length } },
  pageWidth: { get: function () { return _num(_page().style.width) } },
  pageHeight: { get: function () { return _num(_page().style.height) } },
  volume: { get: _volume, set: _vset },
  pitch: { get: function () { return _fx.pitch }, set: function (v) { _fxset('pitch', v) } },
  pan: { get: function () { return _fx.pan }, set: function (v) { _fxset('pan', v) } }
})
