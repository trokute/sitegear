import { state, data, load, blank, markSaved, fail, confirm } from './store'
import { closeKeys } from './anim'

const index = 'sitegear:projects'
const key = id => 'sitegear:project:' + id

function put(k, v) {
  try {
    localStorage.setItem(k, v)
    return true
  } catch (e) {
    fail('Storage is full')
    return false
  }
}

export function list() {
  try {
    return JSON.parse(localStorage.getItem(index)) || []
  } catch (e) {
    return []
  }
}

function keep(l) {
  return put(index, JSON.stringify(l))
}

export function create(name, mode, d) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  if (!put(key(id), JSON.stringify(d || blank(mode)))) return false
  return keep([...list(), { id, name, mode, time: Date.now() }])
}

export function open(id) {
  const m = list().find(p => p.id === id)
  let d = null
  try {
    d = JSON.parse(localStorage.getItem(key(id)))
  } catch (e) {
    d = null
  }
  if (!m || !d) {
    fail('Project not found')
    return
  }
  load(d)
  state.project = id
  state.name = m.name
}

export function save() {
  closeKeys()
  if (!put(key(state.project), JSON.stringify(data()))) return
  keep(list().map(p => p.id === state.project ? { ...p, mode: state.mode, time: Date.now() } : p))
  markSaved()
}

export function leave() {
  if (state.dirty) confirm('This project is not saved. Leave anyway?', () => {
    state.project = null
  })
  else state.project = null
}

export function rename(id, name) {
  keep(list().map(p => p.id === id ? { ...p, name } : p))
}

export function remove(id) {
  localStorage.removeItem(key(id))
  keep(list().filter(p => p.id !== id))
}

export function copy(id) {
  const m = list().find(p => p.id === id)
  create(m.name + ' copy', m.mode, JSON.parse(localStorage.getItem(key(id))))
}

export function exportJson(id) {
  const m = list().find(p => p.id === id)
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([localStorage.getItem(key(id))], { type: 'application/json' }))
  a.download = m.name + '.json'
  a.click()
}

export function importFile(file) {
  return file.text().then(t => {
    const d = JSON.parse(t)
    if (!Array.isArray(d.pages) && !Array.isArray(d.items)) throw new Error()
    create(file.name.replace(/\.json$/i, ''), d.mode || 'blockly', d)
  }).catch(() => fail('Invalid project file'))
}

export async function toJs() {
  const b = await import('./blocks')
  state.js = state.script && state.script.blocks ? b.migrate(state.script) : ''
  state.script = null
  state.mode = 'js'
}
