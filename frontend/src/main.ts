import { createApp } from 'vue'
import { createPinia } from 'pinia' // Import Pinia
import './style.css'
import App from './App.vue'
import router from './router'       // Import Router

const app = createApp(App)

app.use(createPinia()) // Use Pinia
app.use(router)        // Use Router
app.mount('#app')
