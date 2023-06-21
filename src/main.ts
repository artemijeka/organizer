import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/scss/main.scss'

// @note global component registration
// import Test from '@/components/Test.vue'

const app = createApp(App)
// @note global component registration
// .component('Test', Test)

app.use(createPinia())
app.use(router)



// https://vuejs.org/api/application.html#app-config-performance
app.config.performance = true
// @note Регистрации глобальных переменных для приложения:
app.config.globalProperties.window = window;
app.config.globalProperties.document = document;



app.mount('#app')

// @note Регистрация компонента глобально
// app.component('Test', Test)

// @note Свой глобальный обработчик ошибок
// app.config.errorHandler = (err) => {
//   /* handle error */
//   console.log('My error ' + err.message)
// }
