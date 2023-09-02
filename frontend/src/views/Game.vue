<template>
  <div class="text-center">this is the game tap</div>
  <button @click="createNewGame">New Game</button>
  <SearchMatch />
</template>

<script setup lang="ts">
import SearchMatch from '@/components/match/SearchMatch.vue';
import { useMatchStore } from '@/stores/match';
import { onMounted } from 'vue';

const matchStore = useMatchStore()
const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults: pagedMatches } =
  matchStore.pagination

matchStore.init();
matchStore.pagination.pageSize.value = 10

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
