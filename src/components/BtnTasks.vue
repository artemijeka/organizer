<template>
  <div class="tasks">
    <Btn class="tasks__btn" :svgID="'organizer'" />
    <CurTaskName/>
  </div>
</template>

<script setup lang="ts">
import Btn from '@/components/Btn.vue'
import CurTaskName from '@/components/CurTaskName.vue'
</script>