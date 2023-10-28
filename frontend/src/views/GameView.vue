<template>
  <div class="component-title">Game</div>
  <button v-if="!matchStore.currentMatch && !showEndscreen" @click="createNewGame">New Game</button>
  <button v-if="!matchStore.currentMatch && !showEndscreen" @click="joinQueue">Join Queue</button>
  <h1 v-if="showEndscreen">Game ended! {{ winner }} won!</h1>
  <GameComponent
    v-if="matchStore.currentMatch"
    :match="matchStore.currentMatch"
    :player_number="matchStore.player_number"
  />
  <SearchMatch :join-game="matchStore.joinMatch" v-else-if="!showEndscreen" />
</template>

<script setup lang="ts">
import SearchMatch from '@/components/match/SearchMatch.vue'
import router from '@/router'
import { socket } from '@/sockets/sockets'
import { useMatchStore } from '@/stores/match'
import { onMounted, ref } from 'vue'
import GameComponent from '../components/match/GameComponent.vue'

const matchStore = useMatchStore()

//matchStore.init()
matchStore.pagination.pageSize.value = 10

const showEndscreen = ref(false)
const winner = ref('')

setTimeout(async () => {
 await matchStore.fetchCurrentMatch()
})

onMounted(async () => {
  await matchStore.getMatchesToJoin()
  await matchStore.getMatchesToSpectate()
})

socket.on('match_end', async (name: string) => {
  winner.value = name
  showEndscreen.value = true
  setTimeout(() => {
    showEndscreen.value = false
    winner.value = ''
    router.go(0)
  }, 5000)
  matchStore.removeCurrentMatch()
})

async function createNewGame() {
  matchStore.createMatch()
}

function joinQueue() {
  router.push('game/queue')
}
</script>
