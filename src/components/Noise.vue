<template>
  <!-- Путь начинается с ./ чтобы залить приложение в поддирректорию на сервер -->
  <audio ref="elNoise" src="./audio/noise.mp3"></audio>
  <audio ref="elPomodoroEnd" src="./audio/pomodoro-end.mp3"></audio>
</template>

<script setup  lang="ts">
import { usePomodoro } from '@/stores/pomodoro'
import { ref, onMounted, watch } from "vue";
import type { Ref } from 'vue'



let pomodoro = usePomodoro();
let elNoise: Ref = ref<any>(null)
let elPomodoroEnd: Ref = ref<any>(null)
// let soundTrack = ref('@/assets/audio/noise.mp3')

watch(() => pomodoro.state.started, (pomodoroStarted) => {
  startNoise(pomodoroStarted)
})

watch(() => pomodoro.state.paused, (pomodoroPaused) => {
  startNoise(!pomodoroPaused)
})

watch(() => pomodoro.state.end, (isPomodoroEnd) => {
  playPomodoroEnd(isPomodoroEnd)
})

function startNoise(start: any) {
  if (start) {
    elNoise.value.play()
    elNoise.value.addEventListener('ended', loop, false);
  } else {
    elNoise.value.pause()
    elNoise.value.removeEventListener("ended", loop, true);
  }
}

function playPomodoroEnd(isPomodoroEnd: boolean) {
  if (isPomodoroEnd) {
    elPomodoroEnd.value.play()
    elPomodoroEnd.value.addEventListener('ended', returnToStart, false);
  }
}

function loop(e: any) {
  e.target.currentTime = 0;
  e.target.play();
}

function returnToStart(e: any) {
  e.target.currentTime = 0;
}
</script>
