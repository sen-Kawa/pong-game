<template>
  <h1>Waiting Room</h1>
  <p>Looking for an other player...</p>
  <button @click="leaveQueue">Leave Queue</button>
</template>

<script setup lang="ts">
import router from '@/router'
import { socket } from '@/sockets/sockets'
import { useMatchStore } from '@/stores/match'
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const matchStore = useMatchStore()
const canLeave = ref(false)
const shouldLeaveQueue = ref(true)

onBeforeRouteLeave(() => {
  if (canLeave.value) {
    if (shouldLeaveQueue.value) sendLeaveQueueEvent()
    return true
  }
  const answer = window.confirm('Do yo really want to leave the queue?')
  console.debug(answer)
  if (!answer) return false
  sendLeaveQueueEvent()
})

function sendLeaveQueueEvent() {
  socket.emit('leaveQueue')
}

function leaveQueue() {
  canLeave.value = true
  socket.off('newGame')
  router.back()
}

socket.on('newGame', async (matchId: number) => {
  console.log(`joining match ${matchId}`)
  canLeave.value = true
  shouldLeaveQueue.value = false
  // TODO: redirect to the game
  await matchStore.getMatch(matchId)
  router.back()
})
</script>
