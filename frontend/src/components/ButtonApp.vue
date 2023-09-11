<template>
	<button @click="onClick()" :style="{ background: color }" class="btn">{{ text }}</button>
  </template>

  <script lang="ts">
  export default {
	name: 'ButtonApp',
	props: {
	  text: String,
	  color: String
	},
	methods: {
	  onClick() {
		this.$emit('btn-click')
	  }
	}
  }
  </script>
