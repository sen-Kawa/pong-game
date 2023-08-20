<template>
	<div>
		<h2>Search a match</h2>
		<div>
			<!-- <input placeholder="Enter Search Term" @input="search($event.target.value)" /> -->
			<input placeholder="Enter Search Term" />
		</div>
		<div class="filters">
			<!-- <button @click="applyFilters()">Filter #1</button>
			<button @click="applyFilters()">Filter #2</button>
			<div>Filters: {{ filters }}</div> -->
		</div>
	</div>
	<div>
		<ul>
			<MatchItem v-for="match in pagedResults" :key="match.id" :match="match" />
		</ul>
	</div>
	<div>
		<button @click="prevPage()" class="button-link">Previous Page</button>
		Page {{ currentPage }} Showing {{ currentStartIndex }} to {{ currentEndIndex }} of {{ resultCount }} results
		<button @click="nextPage()" class="button-link">Next Page</button>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
// import useSearch from './useSearch'
// import useFilters from './useFilters'
import usePagination from './usePagination'
import MatchService, { Scope } from '@/services/MatchService';
import type { MatchResult } from '@/types/match';
import MatchItem from './MatchItem.vue'

const props = defineProps(['searchTerm'])

// const { searchResults, search } = useSearch(props.searchTerm)

// const { filters, applyFilters, clearFilters, filteredResults } = useFilters(searchResults)

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl)

const filteredResults = ref([] as MatchResult[])

onMounted(async () => {
	console.debug('onMounted')
	getMatches()
})

async function getMatches() {
	// TODO: add search function to match service
	filteredResults.value = await matchService.getMatchHistory(Scope.global)
}
const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults } =
	usePagination(filteredResults)

const resultCount = computed(() => filteredResults.value.length)
</script>
