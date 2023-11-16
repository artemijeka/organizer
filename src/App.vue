<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'

// import { useFetch } from './helpers/fetch'

import SVGSprite from '@/components/SVGSprite.vue'
import Pomodoro from '@/components/Pomodoro.vue'
// import Timer from '@/components/Timer.vue'
// import BtnTasks from '@/components/BtnTasks.vue'
// import Tasks from '@/components/Tasks.vue'
// import { directive } from '@babel/types'



onMounted(()=>{
  window.addEventListener('touchstart', ()=>{}, {capture: true});
})



// @note TS types
// let test = ref<string | number>('test')
// Или
// let test:Ref<string | number> = ref('test')

// @note TS interface
// interface Book {
//   title: string
//   year?: number
// }
// const book: Book = reactive({ title: 'Vue 3 Guide' })

// @note nextTick() - vue буферизирует реактивные данные до следующего nextTick и в этот nextTick обновляется DOM
// https://vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing
// nextTick(() => {
//   // access updated DOM
// })

// @note TS ?
// defineProps<{
//   msg: string
// }>()

</script>

<template>
  <SVGSprite />



  <div class="wrapper fdc">

    <div class="df ais fs1-2">
      <Pomodoro class="mr1" />

      <!-- <Timer class="mr1" /> -->
      <!-- <BtnTasks /> -->
    </div>

    <!-- <div class="tasks__box">
      <Tasks />
    </div> -->

  </div>



  <!-- <RouterView /> -->
</template>