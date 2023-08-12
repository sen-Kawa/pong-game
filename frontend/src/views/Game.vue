<template>
  <div class="text-center">
    this is the game tap
  </div>
  <button @click="createNewGame">New Game</button>
  <MatchList :initial-scope="Scope.inProgress" />
</template>

<script setup lang="ts">
import MatchService, { Scope } from "@/services/MatchService";
import MatchList from "@/components/match/MatchList.vue";

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl);

async function createNewGame() {
  // TODO: indicate progress, error
  const match = await matchService.createMatch()
  console.debug(match)

  await matchService.startMatch(match.data.id)
}
</script>
