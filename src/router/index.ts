import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: []
})

// This callback runs before every route change, including on page load.
// router.beforeEach((to, from, next) => {
//   // console.log('to')
//   // console.log(to)

//   // console.log('from')
//   // console.log(from)

//   // console.log('next')
//   // console.log(next)

//   next()
// })

export default router
