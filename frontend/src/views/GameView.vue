<template>
  <div class="component-title">Game</div>
  <button v-if="!matchStore.currentMatch" @click="createNewGame">New Game</button>
  <button v-if="!matchStore.currentMatch" @click="joinQueue">Join Queue</button>
  <GameComponent
    v-if="matchStore.currentMatch"
    :match="matchStore.currentMatch"
    :player_number="matchStore.player_number"
  />
  <SearchMatch :join-game="matchStore.joinMatch" v-else />
</template>

<script setup lang="ts">
import SearchMatch from '@/components/match/SearchMatch.vue'
import router from '@/router'
import { socket } from '@/sockets/sockets'
import { useMatchStore } from '@/stores/match'
import { onMounted } from 'vue'
import GameComponent from '../components/match/GameComponent.vue'

const matchStore = useMatchStore()

//matchStore.init()
matchStore.pagination.pageSize.value = 10

onMounted(async () => {
  // TODO: only await once
  await matchStore.getMatchesToJoin()
  await matchStore.getMatchesToSpectate()
})

socket.on('match_end', async () => {
  matchStore.removeCurrentMatch()
})

async function createNewGame() {
  matchStore.createMatch()
}

function joinQueue() {
  router.push('game/queue')
}
</script>
