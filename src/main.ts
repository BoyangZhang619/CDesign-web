document.body.innerHTML = '<div style="background:red;color:white;padding:20px;font-size:30px;position:fixed;top:0;z-index:9999">代码已执行</div>';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')