import { state, load } from './store'
import { closeKeys } from './anim'

export function save() {
  closeKeys()
  const d = { pages: state.pages, backdrop: state.backdrop, fonts: state.fonts, script: state.script, sounds: state.sounds, audio: state.audio }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' }))
  a.download = 'project.json'
  a.click()
}

export function open(file) {
  file.text().then(t => {
    try {
      const d = JSON.parse(t)
      if (!Array.isArray(d.pages) && !Array.isArray(d.items)) throw new Error()
      load(d)
    } catch (e) {
      alert('Invalid project file')
    }
  })
}
