// FILE: main.js

import { createApp } from 'vue'

import router from '../src/router'

import { Quasar, Notify } from 'quasar'

import vue3GoogleLogin from 'vue3-google-login'

// Import icon libraries
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import iconSet from 'quasar/icon-set/fontawesome-v6'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

import { createPinia } from 'pinia'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: { Notify }, // import Quasar plugins and add here
  iconSet: iconSet
})

myApp.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
})

myApp.use(router)

myApp.use(createPinia())

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')
