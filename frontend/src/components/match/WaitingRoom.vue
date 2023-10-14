<template>
  <h1>Waiting Room</h1>
  <p>Looking for an other player...</p>
  <button @click="leaveQueue">Leave Queue</button>
</template>

<script setup lang="ts">
import router from '@/router'
import { socket } from '@/sockets/sockets'

function leaveQueue() {
  socket.emit('leaveQueue')
  router.back()
}

socket.on('newGame', (matchId: number) => {
  console.log(`joining match ${matchId}`)
})
</script>
