<template>
  <button class="btn">
    <svg class="btn__ico" :class="`--${svgID}`">
      <use :xlink:href="`#${svgID}`"></use>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps(['svgID']);
</script>