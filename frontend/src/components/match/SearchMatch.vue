<template>
  <div>
    <h2 class="component-subtitle">Search a match</h2>
	  <!--
    <div>
      <input placeholder="Enter Search Term" />
    </div>
	  -->
    <div class="filters">
      <DropDown class="details"
        label="Match Status: "
        :options="matchStore.gameStates"
        @drop-down-value-change="(val) => (matchStore.filters.gameStatus = val)"
      />
	  <!--
      <label>
        <input type="checkbox" v-model="matchStore.filters.includePlayers" />
        includePlayers
      </label>
      <label>
        <input type="checkbox" v-model="matchStore.filters.includeScores" />
        includeScores
      </label>
	  -->
	  <!--
      <div><button @click="matchStore.clearFilters()">Clear Filters</button></div>
	  -->
      <div><button @click="applyFilters()">Apply Filters</button></div>
	  <!--
      <div>Filters: {{ matchStore.filters }}</div>
	  -->
    </div>
  </div>
  <LoadingIndicator :is-loading="matchStore.loading" :error="matchStore.error">
    <MatchList :join-game="joinGame" :matches="pagedMatches" />
  </LoadingIndicator>
  <div>
    <button @click="prevPage()" class="button-link">Previous Page</button>
    Page {{ currentPage }} Showing {{ currentStartIndex }} to {{ currentEndIndex }} of
    {{ matchStore.matchCount }} results
    <button @click="nextPage()" class="button-link">Next Page</button>
  </div>
</template>

<script setup lang="ts">
// import useSearch from './useSearch'
import { useMatchStore } from '@/stores/match'
import { watchEffect, type PropType } from 'vue'
import DropDown from './DropDown.vue'
import LoadingIndicator from './LoadingIndicator.vue'
import MatchList from './MatchList.vue'

defineProps({
    joinGame: {
        type: Function as PropType<(id: number) => void>,
        required: true
    }
})

const matchStore = useMatchStore()

function applyFilters() {
  matchStore.matches = []
  matchStore.getMatches()
}

/**
 * if includeScore gets set, ensure players will also be included
 * this is important because a score are tight to a player
 */
watchEffect(() => {
  if (matchStore.filters.includeScores) matchStore.filters.includePlayers = true
})

watchEffect(() => {
  if (!matchStore.filters.includePlayers) matchStore.filters.includeScores = false
})

const {
  currentPage,
  nextPage,
  prevPage,
  currentStartIndex,
  currentEndIndex,
  pagedResults: pagedMatches
} = matchStore.pagination
</script>

<style scoped></style>
