// @note simple store of pure Vue
import { reactive } from 'vue'

export const storeVue = reactive({
  test: 1,
  doubleTest() {
    this.test *= 2
  }
})
