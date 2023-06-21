<template>
  <div class="timer">

    <Btn :svgID="'pomodoro'" v-if="!pomodoro.state.paused && !pomodoro.state.started" class="timer__btn"
      @click="pomodoro.startPomodoro(pomodoroTimerM)" :title="lang.ru.pomodoro.start" />

    <BtnPause v-else-if="!pomodoro.state.paused && pomodoro.state.started" class="timer__btn-pause"
      @click="pomodoro.pausePomodoro()" :title="lang.ru.pomodoro.pause" />

    <Btn :svgID="'pomodoro'" v-else-if="pomodoro.state.paused && pomodoro.state.started" class="timer__btn --active"
      @click="pomodoro.unpausePomodoro()" :title="lang.ru.pomodoro.unpause" />

    <time class="timer__curtime"><input type="text" min="1" v-model="pomodoroTimerM" @wheel="changeMinutes($event)"
        @focus="changeTypeToNumber($event)" @blur="changeTypeToText($event)"></time>

    <Noise />

  </div>
</template>

<script setup lang="ts">
import { usePomodoro } from '@/stores/pomodoro'
import { onMounted, ref, watch } from "vue";
import BtnPause from '@/components/BtnPause.vue'
import Btn from '@/components/Btn.vue'
import Noise from '@/components/Noise.vue'
import type { Ref } from 'vue'
import lang from '@/lang'



let pomodoro = usePomodoro();
let pomodoroTimerM: Ref = ref<number>(pomodoro.state.defaultM)

watch(pomodoro.getCurPomodoroString, (value) => {
  pomodoroTimerM.value = value
})

function changeTypeToNumber(e: any) {
  e.target.type = 'number'
}
function changeTypeToText(e: any) {
  e.target.type = 'text'
}
function changeMinutes(e: any) {
  if (e.target.deltaY > 0) {
    e.target.value--
  } else if (e.target.deltaY < 0) {
    e.target.value++
  }
}
</script>