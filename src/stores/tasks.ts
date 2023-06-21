import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { getCurTimeS } from '@/helpers/getCurTimeS'
import { getCurTime } from '@/helpers/getCurTime'
// import { incrementSecondTick } from '@/helpers/incrementSecondTick'
import { usePomodoro } from '@/stores/pomodoro'

export const useTasks = defineStore('tasks', () => {
  let pomodoro = usePomodoro()

  // https://thewebdev.info/2022/03/19/how-to-fix-the-ts7053-element-implicitly-has-an-any-type-error-in-typescript/
  const state: { [index: string]: any } = reactive({
    curTask: {
      id: 0, // id === 0 значит задача не выбрана
      // startTimerS === 0 значит на задаче не запущен таймер
      startTimerS: 0,
      interval: null,
      // stopCause: '',
    },
    data: {
      // Ключ задачи является её ID
      // 1: {
      //   // id: 1,
      //   name: ref('1:00 дела по УКЖ'),
      //   durationToday: {
      //     rawSeconds: 0,
      //     seconds: 0,
      //     minutes: 0,
      //     hours: 0,
      //     view: ''
      //   },
      //   timerLog: {
      //     // 1680898071.255: {
      //     //   start: 3,
      //     //   stop: 11,
      //     //   duration: 0
      //     // }
      //   }
      // },
    }
  })

  console.log('state.curTask')
  console.log(state.curTask)



  /************************* INIT CONTROLLER *************************/
  setTasksLogFromLocalStorageToState()
  setCurTaskFromLocalStorageToState()

  // if (state.curTask.stopCause==='reload-page') {
  //   replayTaskTimer()
  // } else {
  //   unselectCurTask()
  // }
  /************************* END CONTROLLER *************************/



  function startTaskTimer(id: number, startTimeS = getCurTimeS()) {
    // Сначала завершить предыдущий таймер задачи
    // Нужно как то получить предыдущий id
    if (getCurTaskID()) {
      stopTaskTimer()
    }

    selectTaskByID(id)
    state.curTask.startTimerS = startTimeS
    // console.log('state.curTask')
    // console.log(state.curTask)
    state.data[getCurTaskID()]['timerLog'][startTimeS] = {
      start: startTimeS,
      stop: 0,
      duration: 0,
      // pause: [],
      // unpause: [],
    }

    startViewUpdateTaskCurDayTimer()
  }



  function stopTaskTimer(/* stopCause = null,  */stopTimeS = getCurTimeS()) {
    const curTaskTimerLog = getCurTaskTimerLog()
    if (curTaskTimerLog) {
      curTaskTimerLog['stop'] = stopTimeS
      // Подсчитываем продолжительность завершённого таймера
      curTaskTimerLog['duration'] = calcCurTaskTimerDuration(curTaskTimerLog)
    }

    // Записать продолжительность таймера за сегодня
    setDurationTimerToday(getCurTaskID(/* получаем запущенного таймера ID потому что остановить таймер можно и запустив другой таймер */))
    // И записать лог задач в localstorage
    setTasksDataToLocalStorage()

    unselectCurTask()
    stopViewUpdateTaskCurDayTimer()
  }



  function setCurTaskFromLocalStorageToState() {
    const JSONCurTask = localStorage.getItem('curTask')

    if (JSONCurTask) {
      const strCurTask = JSON.parse(JSONCurTask)
      // console.log('state.curTask')
      // console.log(state.curTask)
      return state.curTask = strCurTask
    }
  }



  function calcCurTaskTimerDuration(curTaskTimerLog: any) {
    const duration = curTaskTimerLog.stop - curTaskTimerLog.start
    return Number(duration.toFixed(3))
  }



  function getCurTaskID(): number {
    return state.curTask.id
  }



  function getCurTaskTimerLog() {
    const id = getCurTaskID()
    if (id) {
      return state.data[id]['timerLog'][state.curTask.startTimerS]
    }
  }



  function getCurTaskName(): number {
    return state.data[getCurTaskID()].name
  }



  function unselectCurTask() {
    state.curTask.id = 0
    state.curTask.startTimerS = 0
    clearInterval(state.curTask.interval)
    // state.curTask.stopCause = ''
  }



  function selectTaskByID(id: number): void {
    state.curTask.id = id
  }



  function setDurationTimerToday(ID: number) {
    // Старт текущих суток
    const todayTimers = getTimersToday(ID)
    // console.log('todayTimers')
    // console.log(todayTimers)

    const durationToday = state.data[ID].durationToday

    // Перед пересчётом надо обнулить счётчик секунд на эту задачу за сегодня
    durationToday.rawSeconds = 0

    for (const it of todayTimers) {
      durationToday.rawSeconds += it.duration
      // durationToday.rawSeconds += Math.floor(Number(curTaskTimerLog[timerStartID].duration))
    }

    // И приводим в вид 1:10:33
    const todayTaskDuration = convertSecondsToObjectTime(durationToday.rawSeconds)
    durationToday.view = convertObjectTimeToView(todayTaskDuration)
    // return `${hours}:${minutes}:${seconds}`
  }



  function getTimersToday(ID: number) {
    const todayTimers = []

    const startDayS = getStartDayS();

    // Конец текущих суток
    const endDay = new Date()
    endDay.setUTCHours(23, 59, 59, 999)
    const endDayS = endDay.getTime() / 1000

    // Те таймеры которые начаты в пределах старта и конца текущ суток
    const curTaskTimerLog = state.data[ID].timerLog

    for (const timerStartID in curTaskTimerLog) {
      const timerStartS = Number(timerStartID)
      if (startDayS < timerStartS && timerStartS < endDayS) {
        todayTimers.push(curTaskTimerLog[timerStartS])
      }
    }

    return todayTimers
  }



  function getStartDayS() {
    let newDate = new Date()
    newDate.setHours(0, 0, 0, 0)
    return newDate.getTime() / 1000
  }



  function startViewUpdateTaskCurDayTimer() {
    const durationToday = state.data[getCurTaskID()].durationToday

    // rawSeconds копирую чтобы не "испачкать" интервалом
    let intervalSeconds = state.data[getCurTaskID()].durationToday.rawSeconds

    state.curTask.interval = setInterval(() => {
      // Надо чтобы функция в интервале проверяла текущее время и начальное + интервальные секунды
      // incrementSecondTick(timeStartTicks)
      intervalSeconds++

      const todayTaskDuration = convertSecondsToObjectTime(intervalSeconds)
      // посылаю грязные данные от интервала чтобы просто тикание отображать
      durationToday.view = convertObjectTimeToView(todayTaskDuration)

      if (pomodoro.state.paused || !pomodoro.state.started) {
        setCurTaskTimerToTitle(durationToday.view)
      } else if (pomodoro.state.started) {
        setPomodoroAndCurTaskNameToTitle(pomodoro.getCurPomodoroString())
      }

      // console.log(intervalSeconds)
      // @note Каждые 60 секунд запущенного таймера писать данные задач в storage
      // if (intervalSeconds % 60 === 0) {
      //   const curTaskTimerID = getCurTaskID()
      //   stopTaskTimer()
      //   startTaskTimer(curTaskTimerID)
      // }
    }, 1000)
  }



  function setPomodoroAndCurTaskNameToTitle(curPomodoroString: string) {
    document.title = curPomodoroString + ' | ' + getCurTaskName()
  }



  function setCurTaskTimerToTitle(durationTodayView = getCurTaskTimerTodayView()) {
    document.title = durationTodayView + ' | ' + getCurTaskName()
  }



  function getCurTaskTimerTodayView() {
    return state.data[getCurTaskID()].durationToday.view
  }



  function stopViewUpdateTaskCurDayTimer() {
    clearInterval(state.curTask.interval)
  }



  function convertSecondsToObjectTime(seconds: number): any {
    return {
      seconds: Math.floor(seconds % 60),
      minutes: Math.floor((seconds / 60) % 60),
      hours: Math.floor((seconds / 60 / 60) % 24)
    }
  }



  function convertObjectTimeToView(todayTaskDuration: any) {
    return `${todayTaskDuration.hours}:${todayTaskDuration.minutes}:${todayTaskDuration.seconds}`
  }



  function setTasksDataToLocalStorage() {
    console.log('setTasksDataToLocalStorage')
    localStorage.setItem('taskTimerLog', JSON.stringify(state.data))
  }



  function setTasksLogFromLocalStorageToState() {
    console.log('setTasksLogFromLocalStorageToState()')
    const strTaskTimerLog = localStorage.getItem('taskTimerLog')

    // console.log('strTaskTimerLog')
    // console.log(strTaskTimerLog)

    if (strTaskTimerLog) {
      const taskTimerLog = JSON.parse(strTaskTimerLog)
      state.data = taskTimerLog
    }
  }



  function createNewTask(taskName = '') {
    console.log('state.data')
    console.log(state.data)

    let tasksNewID;
    if (Object.keys(state.data).length>0) {
      const lastID = Number(Object.keys(state.data)[Object.keys(state.data).length - 1])
      tasksNewID = lastID + 1
    } else {
      tasksNewID = 1;
    }
    
    state.data[tasksNewID] = {
      name: ref(taskName),
      durationToday: {
        rawSeconds: 0,
        seconds: 0,
        minutes: 0,
        hours: 0,
        view: ''
      },
      timerLog: {
        // 1680898071.255: {
        //   start: 3,
        //   stop: 11,
        //   duration: 0
        // }
      }
    }
    // console.log('state.data[tasksNewID]')
    // console.log(state.data[tasksNewID])
    setTasksDataToLocalStorage()
  }

  

  function deleteTask(id: number) {
    console.log(id)
    delete state.data[id]
    setTasksDataToLocalStorage()
  }



  function showTimerList(ID: number) {
    const timerList = []
    const timersToday = getTimersToday(ID)
    for (const it of timersToday) {
      timerList.push(convertTimerSecondsToTime(it))
    }
    return timerList
  }



  function convertTimerSecondsToTime(timerItem: any) {
    let res = { startID: '', start: '', stop: '', duration: '' }
    res.startID = timerItem.start
    res.start = convertSecondsToTime(timerItem.start)
    res.stop = convertSecondsToTime(timerItem.stop)
    res.duration = convertObjectTimeToView( convertSecondsToObjectTime(timerItem.duration) )

    return res
  }



  function convertSecondsToTime(sec: number) {
    const date = new Date(sec * 1000);

    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
  }

  

  function addTaskTimerItem(taskID: number, newTimer: string) {
    const timer = convertStringToTimerObject(newTimer)
    console.log('timer')
    console.log(timer)

    // console.log('state.data[taskID].timerLog')
    // console.log(state.data[taskID].timerLog)

    state.data[taskID].timerLog[timer.start] = timer
    // Записать продолжительность таймера за сегодня
    setDurationTimerToday(taskID)
    // И записать лог задач в localstorage
    setTasksDataToLocalStorage()
  }



  function convertStringToTimerObject(strTimer: string) {
    const start = strTimer.split('-')[0].trim().split(':')
    const stop = strTimer.split('-')[1].trim().split(':')
    const startDayS = getStartDayS()
    let newTimerStart = startDayS
    let newTimerEnd = startDayS
    console.log('startDayS')
    console.log(startDayS)
    newTimerStart+=Number(start[0])*60*60
    newTimerStart+=Number(start[1])*60
    newTimerStart+=Number(start[2])

    newTimerEnd+=Number(stop[0])*60*60
    newTimerEnd+=Number(stop[1])*60
    newTimerEnd+=Number(stop[2])

    return {
      start: newTimerStart,
      stop: newTimerEnd,
      duration: newTimerEnd-newTimerStart,
    }
  }



  function getTaskById(ID: number) {
    return state.data[ID]
  }



  function deleteTaskTimerItem(taskID: number, timerStartID: number) {
    delete state.data[taskID].timerLog[timerStartID]
    // Записать продолжительность таймера за сегодня
    setDurationTimerToday(taskID)
    // И записать лог задач в localstorage
    setTasksDataToLocalStorage()
  }



  function addTaskTimerNote(taskID: number, timerItemStartID: number, note: string) {
    console.log('taskID')
    console.log(taskID)
    console.log('timerItemStartID')
    console.log(timerItemStartID)
    console.log('state.data[taskID].timerLog[timerItemStartID]')
    console.log(state.data[taskID].timerLog[timerItemStartID])
    let timerItem = state.data[taskID].timerLog[timerItemStartID]
    // timerItem.note = note
  }



  // function calcCurTaskTimerDuration(curTaskTimerLog:any) {
  //   let duration = 0
  //   // Если pause и unpause одинаковое количество, то высчитываем по одному алгоритму
  //   if (curTaskTimerLog.pause.length === curTaskTimerLog.unpause.length) {
  //     duration = curTaskTimerLog.stop
  //     for (let i = curTaskTimerLog.unpause.length - 1; i >= 0; i--) {
  //       duration -= curTaskTimerLog.unpause[i]
  //       duration += curTaskTimerLog.pause[i]
  //     }
  //     duration -= curTaskTimerLog.start
  //   }
  //   // Иначе по другому
  //   else {
  //     duration = curTaskTimerLog.pause[curTaskTimerLog.pause.length - 1]
  //     for (let i = curTaskTimerLog.unpause.length - 1; i >= 0; i--) {
  //       duration -= curTaskTimerLog.unpause[i]
  //       duration += curTaskTimerLog.pause[i]
  //     }
  //     duration -= curTaskTimerLog.start
  //   }

  //   return Number(duration.toFixed(3))
  // }



  return {
    state,

    deleteTask,
    startTaskTimer,
    selectTaskByID,
    stopTaskTimer,
    setTasksDataToLocalStorage,
    createNewTask,
    showTimerList,
    deleteTaskTimerItem,
    addTaskTimerItem,
    addTaskTimerNote,
  }
})