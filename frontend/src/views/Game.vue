<template>
  <div class="text-center">this is the game tap</div>
  <button @click="createNewGame">New Game</button>
  <GameComponent v-if="inGame"/>
  <MatchList v-else :initial-scope="Scope.inProgress" />
</template>

<script setup lang="ts">
import MatchService, { Scope } from '@/services/MatchService'
import MatchList from '@/components/match/MatchList.vue'
import { ref } from 'vue';
import GameComponent from '@/components/match/GameComponent.vue';

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl)
const inGame = ref(false);

async function createNewGame() {
  // TODO: indicate progress, error
  const match = await matchService.createMatch()
  console.debug(match)

  await matchService.startMatch(match.data.id)
  inGame.value = true;
}
</script>
