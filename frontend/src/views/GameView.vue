<template>
  <div class="text-center">this is the game tap</div>
  <button v-if="!matchStore.currentMatch" @click="createNewGame">New Game</button>
  <GameComponent v-if="matchStore.currentMatch" :match="matchStore.currentMatch" :player_number="matchStore.player_number" />
  <SearchMatch :join-game="matchStore.joinMatch" v-else />
</template>

<script setup lang="ts">
import SearchMatch from '@/components/match/SearchMatch.vue'
import { useMatchStore } from '@/stores/match'
import { onMounted } from 'vue'
import GameComponent from '../components/match/GameComponent.vue'

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
</script>
