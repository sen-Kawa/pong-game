import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

import layer from '@layui/layer-vue'
import '@layui/layer-vue/lib/index.css'

const app = createApp(App)

TimeAgo.addDefaultLocale(en)

document.title = '42 Pong'

app.use(createPinia())
app.use(router)
app.use(layer)
app.mount('#app')
