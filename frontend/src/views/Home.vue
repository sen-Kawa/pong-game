<template>
    <div class="text-center">
      this is the home
      <button @click="increment">Count is: {{ count }}</button>
    </div>
</template>

<script lang="ts">
export default {
  // reactive state
  data() {
    return {
      count: 0
    }
  },

  // functions that mutate state and trigger updates
  methods: {
    increment() {
      this.count++
    }
  },

  // lifecycle hooks
  mounted() {
    console.log(`The initial count is ${this.count}.`)
  }
}
</script>
