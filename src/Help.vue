<script setup>
import { state } from './store'
import Icon from './Icon.vue'

const pics = import.meta.glob('./help/*.png', { eager: true, import: 'default' })

const img = n => pics['./help/' + n + '.png']

const sections = [
  {
    t: 'Overview',
    i: ['overview'],
    p: [
      '- you can drag element, rotate it or scale it',
      '- drag to select large area and use shift click to adjust the amount',
      '- alt when dragging to stop snapping.'
    ]
  },
  {
    t: 'Tool Bar',
    i: ['toolbar'],
    p: [
      '1 is select, 2 is rectangle tool, 3 is circle, 4 is text tool, 5 is pencil tool, 6 is save to this browser, 7 is load which goes back to the project window, 8 is preview, 9 is export to html',
      '- image link takes a link or drop an image file right on the page.',
      '- font link takes a Google Fonts link then shows up in the Font list for text.',
      '- you can configure element properties here.'
    ]
  },
  {
    t: 'Shortcuts and right click',
    i: ['menu'],
    p: [
      '- ctrl+Z undo, ctrl+Y redo, ctrl+C / X / V copy cut paste, ctrl+D duplicate, backspace or delete to delete',
      '- right click elements to group or ungroup whats selected.',
      '- name is for scripting to identify the element, in JavaScript it becomes a variable'
    ]
  },
  {
    t: 'Document',
    i: ['document'],
    p: [
      '- the button next to the document text is new page, previous page, next page, and delete page',
      '- you can adjust page size yourself or use the device preset',
      '- page color is the page color..? backdrop is the color outside the page',
      '- you can set a background audio to keep playing and adjust its volume',
      '- copy from duplicates a page',
      '- align snaps the selected element'
    ]
  },
  {
    t: 'Layers',
    i: ['layers'],
    p: [
      '- drag the layer around to move it up and down.'
    ]
  },
  {
    t: 'Animation',
    i: ['animation'],
    p: [
      '- you can apply preset to an element',
      '- set loop for it to keep looping, page open to only play when page opens, site open when the whole site opens, hover when the mouse is hovering on it, click is when its clicked and plays it',
      '- record basically records your own movement on transforming the element and play it back',
      '- keyframe lets you give more complex animation, transform the element, hit keyframe, and set easing.',
      '- none takes the animation off'
    ]
  },
  {
    t: 'Scripting',
    i: ['scripting'],
    p: [
      '- blocks sit in Events, Motion, Looks, Sound, Create, Pen, Layers, Control, Sensing, Operators, Variables and Functions',
      '- give an element a name and it shows up under objects so you can script it',
      '- scripts run in Preview and in the export',
      '- migrate to JavaScript in the document window turns blocks into code and opens a code editor instead, you cannot go back to blocks',
      '- in JavaScript every element with a name is a variable, so ball.x = 100 moves it',
      '- the tabs at the bottom of the scripting window switch between Main and the script of an element, select an element to write its own script and use this to refer to it',
      '- type sg. or this. to see everything available, use await sg.frame() inside loops'
    ]
  },
  {
    t: 'Widgets',
    i: ['widgets', 'play'],
    p: [
      '- open widget window and press add on the one you want to add to the page'
    ]
  },
  {
    t: 'Video and audio',
    i: ['media'],
    p: [
      '- paste a link in media link and press add or drop a video or audio file on the page',
      '- youtube and vimeo links turn into an embed.'
    ]
  }
]
</script>

<template>
  <div class="panel fixed help">
    <div class="head">
      <span>Help</span>
      <Icon class="push" title="Close" :n="25" :s="28" @click="state.help = false" />
    </div>
    <div class="body">
      <template v-for="s in sections" :key="s.t">
        <h4>{{ s.t }}</h4>
        <div class="hs">
          <div class="ht">
            <div v-for="(l, i) in s.p" :key="i" class="line">{{ l }}</div>
          </div>
          <div class="hi">
            <img v-for="n in s.i" :key="n" :src="img(n)">
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
