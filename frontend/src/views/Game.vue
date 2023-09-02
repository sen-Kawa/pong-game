<template>
  <div class="text-center">this is the game tap</div>
  <button @click="createNewGame">New Game</button>
  <LoadingIndicator :is-loading="matchStore.loading" :error="matchStore.error">
    <MatchList :matches="matchStore.matches" />
  </LoadingIndicator>
</template>

<script setup lang="ts">
import LoadingIndicator from '@/components/match/LoadingIndicator.vue';
import MatchList from '@/components/match/MatchList.vue';
import { useMatchStore } from '@/stores/match';
import { onMounted } from 'vue';

const matchStore = useMatchStore()
const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults: pagedMatches } =
  matchStore.pagination

onMounted(async () => {
  console.debug('onMounted')
  // TODO: only await once
  await matchStore.getMatchesToJoin()
  await matchStore.getMatchesToSpectate()
})


async function createNewGame() {
  console.debug('create new game')
  matchStore.createMatch()
}
</script>
