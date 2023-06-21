<template>
  <Btn class="--small" @click="tasks.createNewTask('...')"/>
</template>

<script setup lang="ts">
  import Btn from "@/components/Btn.vue";
  import { useTasks } from '@/stores/tasks';
  const tasks = useTasks();
</script>