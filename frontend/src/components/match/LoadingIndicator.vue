<template>
  <div v-if="isLoading" class="loading">Loading...</div>

  <div v-else-if="error" class="error">
    {{ error }}
  </div>

  <slot v-else> Default Value. </slot>
</template>

<script setup lang="ts">
defineProps({
  isLoading: {
    type: Boolean,
    required: true
  },
  error: {
    type: String
  }
})
</script>
