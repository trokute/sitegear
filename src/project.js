import { state, load, fail } from './store'
import { closeKeys } from './anim'

export function save() {
  try {
    closeKeys()
    const d = { pages: state.pages, backdrop: state.backdrop, fonts: state.fonts, script: state.script, sounds: state.sounds, audio: state.audio }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' }))
    a.download = 'project.json'
    a.click()
  } catch (e) {
    fail('Failed to save project')
  }
}

export function open(file) {
  file.text().then(t => {
    const d = JSON.parse(t)
    if (!Array.isArray(d.pages) && !Array.isArray(d.items)) throw new Error()
    load(d)
  }).catch(() => fail('Invalid project file'))
}
