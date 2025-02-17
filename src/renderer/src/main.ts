import './assets/main.css'
import 'ant-design-vue/dist/reset.css'
import Antd from 'ant-design-vue'
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(Antd).use(router).mount('#app')
