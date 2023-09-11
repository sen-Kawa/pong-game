<template>
  <div>
    <label>{{ label }}</label>
    <select v-model="selectedValue">
      <option v-for="(option, index) in options" :key="index" :value="option">{{ option }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Select an option'
  },
  options: {
    type: Array,
    required: true
  }
})

const selectedValue = ref(props.options[0])

const emits = defineEmits(['dropDownValueChange'])

watch(selectedValue, (newVal) => {
  emits('dropDownValueChange', newVal)
})
</script>
