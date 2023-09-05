<template>
  <div class="text-center">this is the game tap</div>
  <button @click="createNewGame">New Game</button>
  <GameComponent v-if="inGame" :match="match" :player_number="player_number"/>
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
const tmp: any  = undefined;
const match = ref(tmp);
const player_number = ref(0);

async function createNewGame() {
  // TODO: indicate progress, error
  match.value = (await matchService.createMatch()).data

  await matchService.startMatch(match.value.id);
  const joinMatchReturn = await matchService.joinMatch()
  if (joinMatchReturn !== undefined) {
    inGame.value = true;
    player_number.value = joinMatchReturn;
  }
}
</script>
