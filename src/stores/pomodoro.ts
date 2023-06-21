import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { getCurTimeS } from '@/helpers/getCurTimeS'
import { getCurTime } from '@/helpers/getCurTime'
import { useTasks } from '@/stores/tasks'

export const usePomodoro = defineStore('pomodoro', () => {
  let tasks = useTasks()

  interface IPomodoro {
    defaultM: number
    started: boolean
    paused: null | boolean
    end: boolean,
    seconds: number
    minutes: number
    interval?: ReturnType<typeof setTimeout> | number
    startedTimeS: null | number
    endTimeS: null | number
    syncedSeconds: null | number
  }

  const state: IPomodoro = reactive({
    defaultM: 30,
    started: false,
    end: false,
    seconds: 0,
    minutes: 0,
    interval: 0,
    startedTimeS: null,
    endTimeS: null,
    syncedSeconds: null,
    paused: null
  })

  function startPomodoro(pomodoroTimerM: any) {
    // Если предыдущий закончился то ставим значение помодоро по умолчанию при старте
    if (pomodoroTimerM === '0:0') pomodoroTimerM = state.defaultM

    // Проверка если помодоро новый то инициализируем его
    state.startedTimeS = getCurTimeS()
    // state.startedTimeS = getCurTimeS()
    state.endTimeS = state.startedTimeS + state.seconds

    state.minutes = pomodoroTimerM - 1
    state.seconds = 60

    state.started = true
    state.end = false

    pomodoroRunInterval()
  }

  function pomodoroRunInterval(/* stt = tasks.stopTaskTimer */) {
    state.interval = setInterval(() => {
      state.seconds -= 1

      if (state.seconds === 0) {
        if (state.minutes > 0) {
          state.minutes -= 1
          state.seconds = 60
        } else if (state.minutes === 0) {
          // Заканчиваем помодоро
          clearInterval(state.interval)
          state.started = false
          state.end = true

          // Если есть зупущенная задача то остановить её при окончании помидора
          // if (tasks.getSelectedTaskTimerID()) {
          //   stt()
          // }
        }
      }

      // Если таймер на задаче не запущен
      if (tasks.state.curTask.startTimerS===0) {
        // При каждом тике обновляем title
        document.title = getCurPomodoroString() +' | Pomodoro'
      }
    }, 1000)
  }

  function pausePomodoro(/* ptt = tasks.pauseTaskTimer */) {
    if (state.interval) clearInterval(state.interval)
    state.paused = true
    // if (tasks.getSelectedTaskTimerID()) ptt()
  }

  function unpausePomodoro(/* utt = tasks.unpauseTaskTimer */) {
    pomodoroRunInterval()
    state.paused = false
    // if (tasks.getSelectedTaskTimerID()) {
    //   utt()
    // }
  }

  function getCurPomodoroString() {
    return state.minutes + ':' + state.seconds
  }

  /*********************************************************************************/
  /************************************* TIMER *************************************/
  /*********************************************************************************/

  interface ITimer {
    startedTimeMs: number
    syncedSeconds: number
    seconds: number
    minutes: number
    hours: number
    days: number
    interval?: ReturnType<typeof setTimeout> | number
    started: boolean
  }

  // const getCurTimerString = computed(() => {
  //   return timer.hours + ':' + timer.minutes + ':' + timer.seconds
  // })

  function getCurTimerString() {
    return timer.hours + ':' + timer.minutes + ':' + timer.seconds
  }

  function startTimer() {
    timer.startedTimeMs = getCurTime()

    timer.started = true

    timer.interval = window.setInterval(() => {
      // Для визуального отображения интервала в секундах
      timer.seconds += 1

      // Синхронизация таймера с всемирным временем для точности
      if (timer.seconds % 60 === 0) {
        timer.syncedSeconds = Math.floor((getCurTime() - timer.startedTimeMs) / 1000)

        timer.seconds = Math.floor(timer.syncedSeconds % 60)
        timer.minutes = Math.floor((timer.syncedSeconds / 60) % 60)
        timer.hours = Math.floor((timer.syncedSeconds / 60 / 60) % 24)
        timer.days = Math.floor(timer.syncedSeconds / 60 / 60 / 24)
      }
    }, 1000)
  }

  function pauseTimer() {
    clearInterval(timer.interval)
    timer.started = false
  }

  const timer: ITimer = reactive({
    startedTimeMs: 0,
    syncedSeconds: 0,
    seconds: 0,
    minutes: 0,
    hours: 0,
    days: 0,
    // interval: undefined,
    started: false
  })

  return {
    state,
    startPomodoro,
    pausePomodoro,
    unpausePomodoro,
    getCurPomodoroString,

    timer,
    startTimer,
    pauseTimer,
    getCurTimerString
  }
})
