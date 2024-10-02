import { createApp } from "vue"
import router from './components/routers/misrutas'
import App from "./App.vue"

createApp(App)
.use(router)
.mount('#app')