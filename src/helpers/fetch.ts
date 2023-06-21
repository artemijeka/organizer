// fetch.js
// @note fetch можно вынести в модуль "helpers"
// Демонстрация https://vuejs.org/guide/reusability/composables.html#async-state-example
import { ref, isRef, unref, watchEffect } from 'vue'

// @note названия для helpers функций (composable functions) принято называть начиная с use
export function useFetch(url: string) {
  const data = ref(null)
  const error = ref(null)

  function doFetch() {
    // reset state before fetching..
    data.value = null
    error.value = null
    // @note unref() unwraps potential refs
    //   if "url" is indeed a ref, its .value will be returned
    //   otherwise, "url" is returned as-is
    fetch(unref(url))
      .then((res) => res.json())
      .then((json) => (data.value = json))
      .catch((err) => (error.value = err))
  }


  if (isRef(url)) {
    // Всякий раз, когда ссылка на URL изменяется, данные будут сброшены и извлечены снова.
    watchEffect(doFetch)
  } else {
    // otherwise, just fetch once
    // and avoid the overhead of a watcher
    doFetch()
  }

  return { data, error, retry: doFetch }
}