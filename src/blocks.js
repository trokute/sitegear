import * as Blockly from 'blockly'
import { registerFieldColour } from '@blockly/field-colour'
import { javascriptGenerator as gen, Order } from 'blockly/javascript'
import { state } from './store'
import { presets } from './anim'

registerFieldColour()

const extra = new Set()
const extraSnd = new Set()
const fixed = ['mouse-pointer', 'random', 'edge', 'none']

export function names() {
  const s = new Set(extra)
  state.pages.forEach(p => {
    p.items.forEach(i => {
      if (i.cls) s.add(i.cls)
    })
    Object.values(p.groups).forEach(g => {
      if (g.cls) s.add(g.cls)
    })
  })
  if (state.script) {
    for (const m of JSON.stringify(state.script).matchAll(/"CLS":"([^"]*)"/g)) if (m[1]) s.add(m[1])
  }
  return [...s]
}

function sounds() {
  return [...new Set([...state.sounds.map(s => s.name), ...extraSnd])]
}

export function scan(json) {
  const s = JSON.stringify(json)
  for (const m of s.matchAll(/"(?:C|CLS|TO)":"([^"]*)"/g)) if (m[1] && !fixed.includes(m[1])) extra.add(m[1])
  for (const m of s.matchAll(/"SND":"([^"]*)"/g)) if (m[1]) extraSnd.add(m[1])
}

const C = { ev: '#ffbf00', mo: '#4c97ff', lo: '#9966ff', so: '#cf63cf', co: '#ffab19', se: '#5cb1d6', op: '#59c059', cr: '#2ea67a', pe: '#0fbd8c', la: '#8a7be0', ob: '#ff7f50' }

export const theme = Blockly.Theme.defineTheme('sitegear', {
  name: 'sitegear',
  base: Blockly.Themes.Classic,
  blockStyles: {
    hat_blocks: { colourPrimary: C.ev, hat: 'cap' },
    logic_blocks: { colourPrimary: C.op },
    math_blocks: { colourPrimary: C.op },
    text_blocks: { colourPrimary: C.op },
    loop_blocks: { colourPrimary: C.co },
    variable_blocks: { colourPrimary: '#ff8c1a' },
    variable_dynamic_blocks: { colourPrimary: '#ff8c1a' },
    procedure_blocks: { colourPrimary: '#ff6680' }
  }
})

const ifInit = Blockly.Blocks.controls_if.init
Blockly.Blocks.controls_if.init = function () {
  ifInit.call(this)
  this.setColour(C.co)
}

const o = { type: 'input_value', name: 'OBJ', check: 'Obj' }
const num = name => ({ type: 'input_value', name, check: 'Number' })
const any = name => ({ type: 'input_value', name })
const bool = name => ({ type: 'input_value', name, check: 'Boolean' })
const dd = (name, options) => ({ type: 'field_dropdown', name, options })
const st = { type: 'input_statement', name: 'DO' }
const act = { previousStatement: null, nextStatement: null, inputsInline: true }

const keys = [['up', 'ArrowUp'], ['down', 'ArrowDown'], ['left', 'ArrowLeft'], ['right', 'ArrowRight'], ['space', ' '], ['enter', 'Enter'], ['escape', 'Escape'], ['shift', 'Shift'], ['control', 'Control']]
  .concat([...'abcdefghijklmnopqrstuvwxyz0123456789'].map(k => [k, k]))

const props = [['x', 'x'], ['y', 'y'], ['angle', 'angle'], ['width', 'width'], ['height', 'height'], ['opacity', 'opacity'], ['font size', 'size'], ['layer', 'layer']]
const row = { type: 'input_end_row' }
const cls = { type: 'field_input', name: 'CLS', text: 'name' }
const col = v => ({ type: 'field_colour', name: 'COL', colour: v })
const sys = ['sans-serif', 'serif', 'monospace']
const to1 = [['mouse-pointer', 'mouse-pointer']]

const tgt = () => to1.concat(names().map(x => [x, x]))

const ext = (name, field, list) => {
  Blockly.Extensions.register(name, function () {
    this.getField(field).setOptions(list)
  })
}

ext('sg_fonts', 'FONT', () => state.fonts.map(x => x.name).concat(sys).map(x => [x, x]))
ext('sg_snds', 'SND', () => {
  const l = sounds()
  return l.length ? l.map(x => [x, x]) : [['none', '']]
})
ext('sg_tg', 'TO', tgt)
ext('sg_tgr', 'TO', () => [['random position', 'random']].concat(tgt()))
ext('sg_tge', 'TO', () => tgt().concat([['edge', 'edge']]))

const hat = { style: 'hat_blocks', inputsInline: true, message1: 'do %1', args1: [st] }
const eff = dd('E', [['pitch', 'pitch'], ['pan left/right', 'pan']])
const sn = { type: 'field_dropdown', name: 'SND', options: [['none', '']] }
const to = dd('TO', to1)
const cc = { colour: C.co, ...act }

Blockly.common.defineBlocksWithJsonArray([
  { type: 'sg_site', message0: 'when site opens', ...hat },
  { type: 'sg_page', message0: 'when page %1 opens', args0: [{ type: 'field_number', name: 'N', value: 1, min: 1, precision: 1 }], ...hat },
  { type: 'sg_key', message0: 'when key %1 is %2', args0: [dd('KEY', keys), dd('ACT', [['pressed', 'press'], ['held', 'hold'], ['released', 'release']])], ...hat },
  { type: 'sg_touch', message0: 'when %1 is %2', args0: [o, dd('EV', [['clicked', 'click'], ['pressed', 'down'], ['released', 'up'], ['hovered', 'in'], ['left', 'out']])], ...hat },
  { type: 'sg_every', message0: 'every %1 seconds', args0: [{ type: 'field_number', name: 'T', value: 1, min: 0.01 }], ...hat },
  { type: 'sg_msg', message0: 'when I receive %1', args0: [{ type: 'field_input', name: 'M', text: 'go' }], ...hat },
  { type: 'sg_steps', message0: 'move %1 %2 steps', args0: [o, num('V')], colour: C.mo, ...act },
  { type: 'sg_turn', message0: 'turn %1 %2 %3 degrees', args0: [o, dd('D', [['right', '1'], ['left', '-1']]), num('V')], colour: C.mo, ...act },
  { type: 'sg_goto_to', message0: 'go %1 to %2', args0: [o, to], extensions: ['sg_tgr'], colour: C.mo, ...act },
  { type: 'sg_moveto', message0: 'move %1 to x %2 y %3', args0: [o, num('X'), num('Y')], colour: C.mo, ...act },
  { type: 'sg_glideto', message0: 'glide %1 %2 secs to %3', args0: [o, num('T'), to], extensions: ['sg_tgr'], colour: C.mo, ...act },
  { type: 'sg_glide', message0: 'glide %1 to x %2 y %3 in %4 seconds', args0: [o, num('X'), num('Y'), num('T')], colour: C.mo, ...act },
  { type: 'sg_dir', message0: 'point %1 in direction %2', args0: [o, num('V')], colour: C.mo, ...act },
  { type: 'sg_towards', message0: 'point %1 towards %2', args0: [o, to], extensions: ['sg_tg'], colour: C.mo, ...act },
  { type: 'sg_set', message0: 'set %1 %2 to %3', args0: [o, dd('P', props), num('V')], colour: C.mo, ...act },
  { type: 'sg_change', message0: 'change %1 %2 by %3', args0: [o, dd('P', props), num('V')], colour: C.mo, ...act },
  { type: 'sg_bounce', message0: 'if %1 on edge, bounce', args0: [o], colour: C.mo, ...act },
  { type: 'sg_show', message0: '%1 %2', args0: [dd('V', [['show', '1'], ['hide', '0']]), o], colour: C.lo, ...act },
  { type: 'sg_color', message0: 'set %1 color to %2', args0: [o, { type: 'field_colour', name: 'V', colour: '#ff0000' }], colour: C.lo, ...act },
  { type: 'sg_text', message0: 'set %1 text to %2', args0: [o, any('V')], colour: C.lo, ...act },
  { type: 'sg_anim', message0: 'play %1 %2 for %3 seconds', args0: [o, dd('A', presets.map(p => [p[1].toLowerCase(), p[0]])), num('T')], colour: C.lo, ...act },
  { type: 'sg_playwait', message0: 'play sound %1 until done', args0: [sn], extensions: ['sg_snds'], colour: C.so, ...act },
  { type: 'sg_play', message0: 'start sound %1', args0: [sn], extensions: ['sg_snds'], colour: C.so, ...act },
  { type: 'sg_playurl', message0: 'start sound from link %1', args0: [any('V')], colour: C.so, ...act },
  { type: 'sg_stopall', message0: 'stop all sounds', colour: C.so, ...act },
  { type: 'sg_fxchg', message0: 'change %1 effect by %2', args0: [eff, num('V')], colour: C.so, ...act },
  { type: 'sg_fxset', message0: 'set %1 effect to %2', args0: [eff, num('V')], colour: C.so, ...act },
  { type: 'sg_fxclear', message0: 'clear sound effects', colour: C.so, ...act },
  { type: 'sg_vchg', message0: 'change volume by %1', args0: [num('V')], colour: C.so, ...act },
  { type: 'sg_vset', message0: 'set volume to %1 %', args0: [num('V')], colour: C.so, ...act },
  { type: 'sg_bgvol', message0: 'set background volume to %1 %', args0: [num('V')], colour: C.so, ...act },
  { type: 'sg_vol', message0: 'volume', output: 'Number', colour: C.so },
  { type: 'sg_rect', message0: 'create rectangle %1 %2 x %3 y %4 %5 width %6 height %7 %8 color %9 round %10', args0: [cls, row, num('X'), num('Y'), row, num('W'), num('H'), row, col('#cccccc'), num('R')], colour: C.cr, ...act },
  { type: 'sg_circle', message0: 'create circle %1 %2 x %3 y %4 %5 width %6 height %7 %8 color %9', args0: [cls, row, num('X'), num('Y'), row, num('W'), num('H'), row, col('#cccccc')], colour: C.cr, ...act },
  { type: 'sg_newtext', message0: 'create text %1 %2 x %3 y %4 %5 text %6 %7 size %8 font %9 %10 color %11', args0: [cls, row, num('X'), num('Y'), row, any('V'), row, num('S'), dd('FONT', [['sans-serif', 'sans-serif']]), row, col('#000000')], extensions: ['sg_fonts'], colour: C.cr, ...act },
  { type: 'sg_image', message0: 'create image %1 %2 link %3 %4 x %5 y %6 %7 width %8', args0: [cls, row, any('V'), row, num('X'), num('Y'), row, num('W')], colour: C.cr, ...act },
  { type: 'sg_dup', message0: 'duplicate %1', args0: [o], colour: C.cr, ...act },
  { type: 'sg_del', message0: 'delete %1', args0: [o], colour: C.cr, ...act },
  { type: 'sg_pen', message0: 'pen %1 %2', args0: [dd('ON', [['down', '1'], ['up', '0']]), o], colour: C.pe, ...act },
  { type: 'sg_pencol', message0: 'set pen color of %1 to %2', args0: [o, col('#000000')], colour: C.pe, ...act },
  { type: 'sg_pensize', message0: 'set pen size of %1 to %2', args0: [o, num('S')], colour: C.pe, ...act },
  { type: 'sg_clear', message0: 'clear pen', colour: C.pe, ...act },
  { type: 'sg_layer', message0: 'move layer of %1 to %2', args0: [o, dd('W', [['the front', 'front'], ['the back', 'back'], ['one up', 'up'], ['one down', 'down']])], colour: C.la, ...act },
  { type: 'sg_layers', message0: 'number of layers', output: 'Number', colour: C.la },
  { type: 'sg_at', message0: 'object on layer %1', args0: [num('N')], output: 'Obj', colour: C.la, inputsInline: true },
  { type: 'sg_class', message0: 'class of %1', args0: [o], output: 'String', colour: C.la, inputsInline: true },
  { type: 'sg_wait', message0: 'wait %1 seconds', args0: [num('T')], ...cc },
  { type: 'sg_repeat', message0: 'repeat %1', args0: [num('N')], message1: 'do %1', args1: [st], ...cc },
  { type: 'sg_repuntil', message0: 'repeat until %1', args0: [bool('COND')], message1: 'do %1', args1: [st], ...cc },
  { type: 'sg_waituntil', message0: 'wait until %1', args0: [bool('COND')], ...cc },
  { type: 'sg_forever', message0: 'forever', message1: 'do %1', args1: [st], previousStatement: null, colour: C.co, inputsInline: true },
  { type: 'sg_after', message0: 'after %1 seconds', args0: [num('T')], message1: 'do %1', args1: [st], ...cc },
  { type: 'sg_send', message0: 'send %1', args0: [{ type: 'field_input', name: 'M', text: 'go' }], ...cc },
  { type: 'sg_goto', message0: 'go to page %1', args0: [num('P')], ...cc },
  { type: 'sg_nav', message0: 'go to %1 page', args0: [dd('D', [['next', '1'], ['previous', '-1']])], ...cc },
  { type: 'sg_link', message0: 'open link %1', args0: [any('V')], ...cc },
  { type: 'sg_touching', message0: '%1 touching %2', args0: [o, { type: 'input_value', name: 'B', check: 'Obj' }], output: 'Boolean', colour: C.se, inputsInline: true },
  { type: 'sg_touchto', message0: '%1 touching %2', args0: [o, to], extensions: ['sg_tge'], output: 'Boolean', colour: C.se, inputsInline: true },
  { type: 'sg_dist', message0: 'distance of %1 to %2', args0: [o, to], extensions: ['sg_tg'], output: 'Number', colour: C.se, inputsInline: true },
  { type: 'sg_keydown', message0: 'key %1 pressed?', args0: [dd('KEY', keys)], output: 'Boolean', colour: C.se },
  { type: 'sg_mousedown', message0: 'mouse down?', output: 'Boolean', colour: C.se },
  { type: 'sg_mouse', message0: 'mouse %1', args0: [dd('A', [['x', 'x'], ['y', 'y']])], output: 'Number', colour: C.se },
  { type: 'sg_drag', message0: 'set drag mode of %1 to %2', args0: [o, dd('M', [['draggable', '1'], ['not draggable', '0']])], colour: C.se, ...act },
  { type: 'sg_loud', message0: 'loudness', output: 'Number', colour: C.se },
  { type: 'sg_timer', message0: 'timer', output: 'Number', colour: C.se },
  { type: 'sg_rtimer', message0: 'reset timer', colour: C.se, ...act },
  { type: 'sg_get', message0: '%1 of %2', args0: [dd('P', props.concat([['text', 'text']])), o], output: null, colour: C.se, inputsInline: true },
  { type: 'sg_join', message0: 'join %1 %2', args0: [any('A'), any('B')], output: 'String', colour: C.op, inputsInline: true },
  { type: 'sg_letter', message0: 'letter %1 of %2', args0: [num('N'), any('V')], output: 'String', colour: C.op, inputsInline: true },
  { type: 'sg_contains', message0: '%1 contains %2 ?', args0: [any('A'), any('B')], output: 'Boolean', colour: C.op, inputsInline: true }
])

Blockly.Blocks.sg_obj = {
  init() {
    this.appendDummyInput().appendField(new Blockly.FieldDropdown(() => {
      const l = names()
      return l.length ? l.map(n => [n, n]) : [['none', '']]
    }), 'C')
    this.setOutput(true, 'Obj')
    this.setColour(C.ob)
  }
}

const val = (b, n) => gen.valueToCode(b, n, Order.NONE) || '0'
const vs = (b, n) => gen.valueToCode(b, n, Order.NONE) || "''"
const obj = b => gen.valueToCode(b, 'OBJ', Order.NONE) || 'null'
const body = b => gen.statementToCode(b, 'DO')
const js = JSON.stringify
const f = gen.forBlock
const fld = (b, n) => js(b.getFieldValue(n))
const tail = new Set(['sg_playwait', 'sg_waituntil', 'sg_repeat', 'sg_repuntil', 'sg_wait'])

const scrub = gen.scrub_
gen.scrub_ = function (b, code, only) {
  return scrub.call(this, b, code, only || tail.has(b.type))
}

const rest = b => {
  const nx = b.getNextBlock()
  return gen.prefixLines(nx ? gen.blockToCode(nx) : '', gen.INDENT)
}

const cond = b => gen.valueToCode(b, 'COND', Order.NONE) || 'false'
const on = (t, b) => '_on(' + js(t) + ', function () {\n' + body(b) + '});\n'

f.sg_site = b => on('site', b)
f.sg_page = b => on('page:' + b.getFieldValue('N'), b)
f.sg_key = b => on(b.getFieldValue('ACT') + ':' + b.getFieldValue('KEY'), b)
f.sg_msg = b => on('msg:' + b.getFieldValue('M'), b)
f.sg_every = b => '_every(' + b.getFieldValue('T') + ', function () {\n' + body(b) + '});\n'
f.sg_touch = b => {
  const t = b.getInputTargetBlock('OBJ')
  return t && t.type === 'sg_obj' ? on(b.getFieldValue('EV') + ':' + t.getFieldValue('C'), b) : ''
}
f.sg_steps = b => '_steps(' + obj(b) + ', ' + val(b, 'V') + ');\n'
f.sg_turn = b => '_chg(' + obj(b) + ', "angle", ' + b.getFieldValue('D') + ' * (' + val(b, 'V') + '));\n'
f.sg_goto_to = b => '_goto(' + obj(b) + ', ' + fld(b, 'TO') + ');\n'
f.sg_moveto = b => '_move(' + obj(b) + ', ' + val(b, 'X') + ', ' + val(b, 'Y') + ');\n'
f.sg_glideto = b => '_glideto(' + obj(b) + ', ' + val(b, 'T') + ', ' + fld(b, 'TO') + ');\n'
f.sg_glide = b => '_glide(' + obj(b) + ', ' + val(b, 'X') + ', ' + val(b, 'Y') + ', ' + val(b, 'T') + ');\n'
f.sg_dir = b => '_set(' + obj(b) + ', "angle", ' + val(b, 'V') + ');\n'
f.sg_towards = b => '_towards(' + obj(b) + ', ' + fld(b, 'TO') + ');\n'
f.sg_set = b => '_set(' + obj(b) + ', ' + fld(b, 'P') + ', ' + val(b, 'V') + ');\n'
f.sg_change = b => '_chg(' + obj(b) + ', ' + fld(b, 'P') + ', ' + val(b, 'V') + ');\n'
f.sg_bounce = b => '_bounce(' + obj(b) + ');\n'
f.sg_show = b => '_vis(' + obj(b) + ', ' + b.getFieldValue('V') + ');\n'
f.sg_color = b => '_color(' + obj(b) + ', ' + fld(b, 'V') + ');\n'
f.sg_text = b => '_set(' + obj(b) + ', "text", ' + val(b, 'V') + ');\n'
f.sg_anim = b => '_anim(' + obj(b) + ', ' + fld(b, 'A') + ', ' + val(b, 'T') + ');\n'
f.sg_playwait = b => '_snd(' + fld(b, 'SND') + ', function () {\n' + rest(b) + '});\n'
f.sg_play = b => '_snd(' + fld(b, 'SND') + ');\n'
f.sg_playurl = b => '_play(' + vs(b, 'V') + ');\n'
f.sg_stopall = () => '_stopall();\n'
f.sg_fxchg = b => '_fxchg(' + fld(b, 'E') + ', ' + val(b, 'V') + ');\n'
f.sg_fxset = b => '_fxset(' + fld(b, 'E') + ', ' + val(b, 'V') + ');\n'
f.sg_fxclear = () => '_fxclear();\n'
f.sg_vchg = b => '_vchg(' + val(b, 'V') + ');\n'
f.sg_vset = b => '_vset(' + val(b, 'V') + ');\n'
f.sg_bgvol = b => '_bgvol(' + val(b, 'V') + ');\n'
f.sg_vol = () => ['_vol', Order.ATOMIC]

const cl = b => fld(b, 'CLS')
const co = b => fld(b, 'COL')
const ar = (b, ...k) => k.map(x => val(b, x)).join(', ')

f.sg_rect = b => '_rect(' + cl(b) + ', ' + ar(b, 'X', 'Y', 'W', 'H') + ', ' + co(b) + ', ' + val(b, 'R') + ');\n'
f.sg_circle = b => '_circle(' + cl(b) + ', ' + ar(b, 'X', 'Y', 'W', 'H') + ', ' + co(b) + ');\n'
f.sg_newtext = b => '_newtext(' + cl(b) + ', ' + vs(b, 'V') + ', ' + ar(b, 'X', 'Y', 'S') + ', ' + fld(b, 'FONT') + ', ' + co(b) + ');\n'
f.sg_image = b => '_img(' + cl(b) + ', ' + vs(b, 'V') + ', ' + ar(b, 'X', 'Y', 'W') + ');\n'
f.sg_dup = b => '_dup(' + obj(b) + ');\n'
f.sg_del = b => '_del(' + obj(b) + ');\n'
f.sg_pen = b => '_pen(' + obj(b) + ', ' + b.getFieldValue('ON') + ');\n'
f.sg_pencol = b => '_pcol(' + obj(b) + ', ' + co(b) + ');\n'
f.sg_pensize = b => '_psize(' + obj(b) + ', ' + val(b, 'S') + ');\n'
f.sg_clear = () => '_clear();\n'
f.sg_layer = b => '_layer(' + obj(b) + ', ' + fld(b, 'W') + ');\n'
f.sg_layers = () => ['_count()', Order.FUNCTION_CALL]
f.sg_at = b => ['_at(' + val(b, 'N') + ')', Order.FUNCTION_CALL]
f.sg_class = b => ['_cname(' + obj(b) + ')', Order.FUNCTION_CALL]

f.sg_wait = b => 'setTimeout(function () {\n' + rest(b) + '}, (' + val(b, 'T') + ') * 1000);\n'
f.sg_repeat = b => '_repeat(' + val(b, 'N') + ', function () {\n' + body(b) + '}, function () {\n' + rest(b) + '});\n'
f.sg_repuntil = b => '_loop(function () {\n  return ' + cond(b) + ';\n}, function () {\n' + body(b) + '}, function () {\n' + rest(b) + '});\n'
f.sg_waituntil = b => '_wait(function () {\n  return ' + cond(b) + ';\n}, function () {\n' + rest(b) + '});\n'
f.sg_forever = b => '_forever(function () {\n' + body(b) + '});\n'
f.sg_after = b => 'setTimeout(function () {\n' + body(b) + '}, (' + val(b, 'T') + ') * 1000);\n'
f.sg_send = b => '_fire(' + js('msg:' + b.getFieldValue('M')) + ');\n'
f.sg_goto = b => '_go(' + val(b, 'P') + ');\n'
f.sg_nav = b => '_nav(' + b.getFieldValue('D') + ');\n'
f.sg_link = b => '_link(' + vs(b, 'V') + ');\n'
f.sg_obj = b => ['_q(' + fld(b, 'C') + ')', Order.FUNCTION_CALL]
f.sg_touching = b => ['_hit(' + obj(b) + ', ' + (gen.valueToCode(b, 'B', Order.NONE) || 'null') + ')', Order.FUNCTION_CALL]
f.sg_touchto = b => ['_touch(' + obj(b) + ', ' + fld(b, 'TO') + ')', Order.FUNCTION_CALL]
f.sg_dist = b => ['_dist(' + obj(b) + ', ' + fld(b, 'TO') + ')', Order.FUNCTION_CALL]
f.sg_keydown = b => ['_down(' + fld(b, 'KEY') + ')', Order.FUNCTION_CALL]
f.sg_mousedown = () => ['_mdown()', Order.FUNCTION_CALL]
f.sg_mouse = b => ['_mouse(' + fld(b, 'A') + ')', Order.FUNCTION_CALL]
f.sg_drag = b => '_dragmode(' + obj(b) + ', ' + b.getFieldValue('M') + ');\n'
f.sg_loud = () => ['_loud()', Order.FUNCTION_CALL]
f.sg_timer = () => ['_timer()', Order.FUNCTION_CALL]
f.sg_rtimer = () => '_rtimer();\n'
f.sg_get = b => ['_get(' + obj(b) + ', ' + fld(b, 'P') + ')', Order.FUNCTION_CALL]
f.sg_join = b => ['String(' + vs(b, 'A') + ') + String(' + vs(b, 'B') + ')', Order.ADDITION]
f.sg_letter = b => ['String(' + vs(b, 'V') + ').charAt((' + val(b, 'N') + ') - 1)', Order.FUNCTION_CALL]
f.sg_contains = b => ['String(' + vs(b, 'A') + ').toLowerCase().indexOf(String(' + vs(b, 'B') + ').toLowerCase()) >= 0', Order.RELATIONAL]

const sh = (type, fields) => ({ shadow: { type, fields } })
const n = v => sh('math_number', { NUM: v })
const t = v => sh('text', { TEXT: v })
const bk = (type, inputs, fields, extraState) => ({ kind: 'block', type, inputs, fields, extraState })
const cat = (name, colour, contents) => ({ kind: 'category', name, colour, contents })
const arith = op => bk('math_arithmetic', { A: n(1), B: n(1) }, { OP: op })
const cmp = (op, v) => bk('logic_compare', { A: n(0), B: n(v) }, { OP: op })

export const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    cat('Events', C.ev, ['sg_site', 'sg_page', 'sg_key', 'sg_touch', 'sg_every', 'sg_msg', 'sg_send'].map(x => bk(x))),
    { kind: 'category', name: 'Objects', colour: C.ob, custom: 'OBJECTS' },
    cat('Motion', C.mo, [
      bk('sg_steps', { V: n(10) }),
      bk('sg_turn', { V: n(15) }, { D: '1' }),
      bk('sg_turn', { V: n(15) }, { D: '-1' }),
      bk('sg_goto_to'),
      bk('sg_moveto', { X: n(0), Y: n(0) }),
      bk('sg_glideto', { T: n(1) }),
      bk('sg_glide', { X: n(0), Y: n(0), T: n(1) }),
      bk('sg_dir', { V: n(90) }),
      bk('sg_towards'),
      bk('sg_change', { V: n(10) }, { P: 'x' }),
      bk('sg_set', { V: n(0) }, { P: 'x' }),
      bk('sg_change', { V: n(10) }, { P: 'y' }),
      bk('sg_set', { V: n(0) }, { P: 'y' }),
      bk('sg_bounce'),
      bk('sg_get', undefined, { P: 'x' }),
      bk('sg_get', undefined, { P: 'y' }),
      bk('sg_get', undefined, { P: 'angle' })
    ]),
    cat('Looks', C.lo, [
      bk('sg_show'),
      bk('sg_color'),
      bk('sg_text', { V: t('Text') }),
      bk('sg_set', { V: n(100) }, { P: 'opacity' }),
      bk('sg_anim', { T: n(1) })
    ]),
    cat('Sound', C.so, [
      { kind: 'label', text: 'Drop audio files here' },
      bk('sg_playwait'),
      bk('sg_play'),
      bk('sg_stopall'),
      bk('sg_fxchg', { V: n(10) }),
      bk('sg_fxset', { V: n(100) }),
      bk('sg_fxclear'),
      bk('sg_vchg', { V: n(-10) }),
      bk('sg_vset', { V: n(100) }),
      bk('sg_vol'),
      bk('sg_playurl', { V: t('https://') }),
      bk('sg_bgvol', { V: n(100) })
    ]),
    cat('Create', C.cr, [
      bk('sg_rect', { X: n(0), Y: n(0), W: n(100), H: n(100), R: n(0) }),
      bk('sg_circle', { X: n(0), Y: n(0), W: n(100), H: n(100) }),
      bk('sg_newtext', { X: n(0), Y: n(0), V: t('Text'), S: n(32) }),
      bk('sg_image', { V: t('https://'), X: n(0), Y: n(0), W: n(200) }),
      bk('sg_dup'),
      bk('sg_del')
    ]),
    cat('Pen', C.pe, [
      bk('sg_pen'),
      bk('sg_pencol'),
      bk('sg_pensize', { S: n(4) }),
      bk('sg_clear')
    ]),
    cat('Layers', C.la, [
      bk('sg_layer'),
      bk('sg_set', { V: n(1) }, { P: 'layer' }),
      bk('sg_change', { V: n(1) }, { P: 'layer' }),
      bk('sg_get', undefined, { P: 'layer' }),
      bk('sg_layers'),
      bk('sg_at', { N: n(1) }),
      bk('sg_class')
    ]),
    cat('Control', C.co, [
      bk('sg_wait', { T: n(1) }),
      bk('sg_repeat', { N: n(10) }),
      bk('sg_forever'),
      bk('controls_if'),
      bk('controls_if', undefined, undefined, { hasElse: true }),
      bk('sg_waituntil'),
      bk('sg_repuntil'),
      bk('sg_goto', { P: n(1) }),
      bk('sg_nav'),
      bk('sg_link', { V: t('https://') })
    ]),
    cat('Sensing', C.se, [
      bk('sg_touchto'),
      bk('sg_touching'),
      bk('sg_dist'),
      bk('sg_keydown'),
      bk('sg_mousedown'),
      bk('sg_mouse', undefined, { A: 'x' }),
      bk('sg_mouse', undefined, { A: 'y' }),
      bk('sg_drag'),
      bk('sg_loud'),
      bk('sg_timer'),
      bk('sg_rtimer'),
      bk('sg_get')
    ]),
    cat('Operators', C.op, [
      arith('ADD'),
      arith('MINUS'),
      arith('MULTIPLY'),
      arith('DIVIDE'),
      bk('math_random_int', { FROM: n(1), TO: n(10) }),
      cmp('GT', 50),
      cmp('LT', 50),
      cmp('EQ', 50),
      bk('logic_operation', undefined, { OP: 'AND' }),
      bk('logic_operation', undefined, { OP: 'OR' }),
      bk('logic_negate'),
      bk('sg_join', { A: t('apple'), B: t('banana') }),
      bk('sg_letter', { N: n(1), V: t('apple') }),
      bk('text_length', { VALUE: t('apple') }),
      bk('sg_contains', { A: t('apple'), B: t('a') }),
      bk('math_modulo', { DIVIDEND: n(10), DIVISOR: n(3) }),
      bk('math_round', { NUM: n(0) }, { OP: 'ROUND' }),
      bk('math_number'),
      bk('text'),
      bk('logic_boolean'),
      bk('text_join')
    ]),
    { kind: 'category', name: 'Variables', colour: '#ff8c1a', custom: 'VARIABLE' },
    { kind: 'category', name: 'Functions', colour: '#ff6680', custom: 'PROCEDURE' }
  ]
}

export function setup(ws) {
  ws.registerToolboxCategoryCallback('OBJECTS', () => {
    const l = names()
    if (!l.length) return [{ kind: 'label', text: 'Right click an element to set its class' }]
    return l.map(c => ({ kind: 'block', type: 'sg_obj', fields: { C: c } }))
  })
}

export function compile(json) {
  const d = JSON.parse(JSON.stringify(json))
  scan(d)
  const ws = new Blockly.Workspace()
  Blockly.serialization.workspaces.load(d, ws)
  const code = gen.workspaceToCode(ws)
  ws.dispose()
  return code.replace(/^var ([^;]+);/m, (m, v) => 'var ' + v.split(', ').map(x => x + ' = 0').join(', ') + ';')
}
