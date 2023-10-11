<template>
  <div class="component-title">Game</div>
  <button @click="createNewGame">New Game</button>
  <button @click="joinQueue">Join Queue</button>
  <SearchMatch />
</template>

<script setup lang="ts">
import SearchMatch from '@/components/match/SearchMatch.vue'
import router from '@/router'
import { socket } from '@/sockets/sockets'
import { useMatchStore } from '@/stores/match'
import { onMounted } from 'vue'

const matchStore = useMatchStore()

matchStore.init()
matchStore.pagination.pageSize.value = 10

onMounted(async () => {
  // TODO: only await once
  await matchStore.getMatchesToJoin()
  await matchStore.getMatchesToSpectate()
})

async function createNewGame() {
  matchStore.createMatch()
}

function joinQueue() {
  socket.emit('joinQueue')
  router.push('game/queue')
}
</script>
