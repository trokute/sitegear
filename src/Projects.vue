<script setup>
import { computed, ref } from 'vue'
import { fail, confirm } from './store'
import { list, create, open, rename, remove, copy, exportJson, importFile } from './projects'

const name = ref('')
const mode = ref('blockly')
const sort = ref('time')
const edit = ref('')
const label = ref('')
const items = ref(list())
const file = ref(null)

const rows = computed(() => [...items.value].sort((a, b) => sort.value === 'name' ? a.name.localeCompare(b.name) : b.time - a.time))

function refresh() {
  items.value = list()
}

function make() {
  const n = name.value.trim()
  if (!n) {
    fail('Name the project')
    return
  }
  if (create(n, mode.value)) name.value = ''
  refresh()
}

function begin(p) {
  edit.value = p.id
  label.value = p.name
}

function finish() {
  const n = label.value.trim()
  if (n) rename(edit.value, n)
  edit.value = ''
  refresh()
}

function ask(p) {
  confirm('Delete ' + p.name + '?', () => {
    remove(p.id)
    refresh()
  })
}

function dup(p) {
  copy(p.id)
  refresh()
}

function pick(e) {
  const f = e.target.files[0]
  e.target.value = ''
  if (f) importFile(f).then(refresh)
}

function when(t) {
  return new Date(t).toLocaleString()
}
</script>

<template>
  <div class="projects">
    <div class="panel fixed pj">
      <div class="head">
        <span>Projects</span>
      </div>
      <div class="body">
        <h4>New project</h4>
        <div class="line">
          <input v-model="name" placeholder="Project name" @keydown.enter="make">
        </div>
        <div class="line">
          <label>Scripting</label>
          <select v-model="mode">
            <option value="blockly">Blockly</option>
            <option value="js">JavaScript</option>
          </select>
        </div>
        <div class="line">
          <button class="tb" @click="make">Create</button>
          <button class="tb" @click="file.click()">Import json</button>
          <input ref="file" type="file" accept=".json,application/json" hidden @change="pick">
        </div>
        <h4>Your projects</h4>
        <div class="line">
          <label>Sort</label>
          <select v-model="sort">
            <option value="time">Recent</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div v-for="p in rows" :key="p.id" class="card pr">
          <div class="line">
            <input v-if="edit === p.id" v-model="label" @keydown.enter="finish" @keydown.esc="edit = ''">
            <span v-else class="lname">{{ p.name }}</span>
            <span>{{ p.mode === 'js' ? 'JavaScript' : 'Blockly' }}</span>
          </div>
          <div class="line">{{ when(p.time) }}</div>
          <div class="line">
            <button class="tb" @click="open(p.id)">Open</button>
            <button class="tb" @click="edit === p.id ? finish() : begin(p)">{{ edit === p.id ? 'Done' : 'Rename' }}</button>
            <button class="tb" @click="dup(p)">Copy</button>
            <button class="tb" @click="exportJson(p.id)">Export</button>
            <button class="tb" @click="ask(p)">Delete</button>
          </div>
        </div>
        <div v-if="!rows.length" class="line">No projects yet</div>
      </div>
    </div>
  </div>
</template>
