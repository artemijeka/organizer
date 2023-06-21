<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePomodoro } from '@/stores/pomodoro.js';
import BtnPause from "@/components/BtnPause.vue";
import Btn from "@/components/Btn.vue";
let pomodoro = usePomodoro();
</script>

<template>
  <div class="timer">

    <Btn v-if="!pomodoro.timer.started" class="timer__btn" @click="pomodoro.startTimer()" :svgID="'triangle'"/>

    <BtnPause v-else class="timer__btn-pause" @click="pomodoro.pauseTimer()" />

    <time class="timer__curtime">{{ pomodoro.getCurTimerString() }}</time>
  </div>
</template>

