<script setup lang="ts">
import type { MatchResult } from '@/types/match'
import TimeAgo from 'javascript-time-ago'
import { type PropType } from 'vue'
import { computed } from 'vue'

const props = defineProps({
  match: {
    type: Object as PropType<MatchResult>,
    required: true
  }
})

const duration = computed(() => {
  const start = props.match.start
  const end = props.match.end ?? new Date(Date.now())
  const duration = end.getTime() - start.getTime()
  const result = new Date(duration)
  return result.toLocaleTimeString('de-DE', {
    timeStyle: 'medium'
  })
})

const timeSinceEnd = computed(() => {
  if (!props.match.end) return
  const timeAgo = new TimeAgo('en-US')
  return timeAgo.format(props.match.end)
})

// const highscore = computed(() => {
//   return Math.max(props.match.players[0].score, props.match.players[1].score)
// })
</script>

<template>
  <div class="card">
    <h3>Match #{{ match.id }}</h3>
    <p v-if="match.players">
      <!-- TODO: highlight the winner -->
      <span v-if="match.players[0]">{{ match.players[0].name }}</span>
      vs
      <span v-if="match.players[1]">{{ match.players[1].name }}</span>
      <span v-else>???</span>
    </p>
    <p v-if="match.end">{{ match.players[0].score }} : {{ match.players[1].score }}</p>
    <p id="match-time-since-end">{{ timeSinceEnd }}</p>
    <!-- TODO: watch to live update the duration for matches in progress -->
    <p>duration: {{ duration }}</p>
    <button v-if="!match.end">Join Game</button>
  </div>
</template>

<style scoped>
.card {
  background-color: darkgray;
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 200px;
  min-width: 200px;
  max-width: 300px;
  box-sizing: border-box;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
