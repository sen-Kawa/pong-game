<template>
	<div>
		<h2>Search a match</h2>
		<div>
			<!-- <input placeholder="Enter Search Term" @input="search($event.target.value)" /> -->
			<input placeholder="Enter Search Term" />
		</div>
		<div class="filters">
			<label>
				<input type="checkbox" v-model="filters.started" />
				started
			</label>
			<label>
				<input type="checkbox" v-model="filters.completed" />
				completed
			</label>
			<label>
				<input type="checkbox" v-model="filters.includeScores" />
				includeScores
			</label>
			<label>
				<input type="checkbox" v-model="filters.includePlayers" />
				includePlayers
			</label>
			<div><button @click="clearFilters()">Clear Filters</button></div>
			<div><button @click="applyFilters()">Apply Filters</button></div>
			<div>Filters: {{ filters }}</div>
		</div>
	</div>
	<div>
		<ul class="match-list">
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
import { computed, onMounted, onUpdated, ref } from 'vue'
// import useSearch from './useSearch'
import useFilters from './useFilters'
import usePagination from './usePagination'
import MatchService, { Scope } from '@/services/MatchService';
import type { MatchResult } from '@/types/match';
import MatchItem from './MatchItem.vue'

const props = defineProps(['searchTerm'])

// const { searchResults, search } = useSearch(props.searchTerm)

// const { filters, applyFilters, clearFilters } = useFilters()
const { filters, clearFilters } = useFilters()
console.debug(filters.value)

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl)

const filteredResults = ref([] as MatchResult[])

onMounted(async () => {
	console.debug('onMounted')
	getMatches()
})

function applyFilters() {
	getMatches()
}

async function getMatches() {
	// TODO: add search function to match service
	filteredResults.value = await matchService.getMatches(filters.value)
}
const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults } =
	usePagination(filteredResults)

const resultCount = computed(() => filteredResults.value.length)
</script>

<style scoped>
.match-list {
	list-style: none;
	display: flex;
	flex-flow: row;
	justify-content: space-around;
	padding: 0;
	gap: 7px;
}
</style>
