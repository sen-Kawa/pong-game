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
				<input type="checkbox" v-model="filters.includePlayers" />
				includePlayers
			</label>
			<label>
				<input type="checkbox" v-model="filters.includeScores" />
				includeScores
			</label>
			<div><button @click="clearFilters()">Clear Filters</button></div>
			<div><button @click="applyFilters()">Apply Filters</button></div>
			<div>Filters: {{ filters }}</div>
		</div>
	</div>
	<LoadingIndicator :is-loading="loading" :error="error">
		<MatchList :matches="pagedResults" />
	</LoadingIndicator>
	<div>
		<button @click="prevPage()" class="button-link">Previous Page</button>
		Page {{ currentPage }} Showing {{ currentStartIndex }} to {{ currentEndIndex }} of {{ resultCount }} results
		<button @click="nextPage()" class="button-link">Next Page</button>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
// import useSearch from './useSearch'
import MatchService from '@/services/MatchService';
import type { MatchResult } from '@/types/match';
import LoadingIndicator from './LoadingIndicator.vue';
import MatchList from './MatchList.vue';
import useFilters from './useFilters';
import usePagination from './usePagination';

const props = defineProps(['searchTerm'])

const loading = ref(false)
const error = ref('')
const matches = ref([] as MatchResult[])

// const { searchResults, search } = useSearch(props.searchTerm)

// const { filters, applyFilters, clearFilters } = useFilters()
const { filters, clearFilters } = useFilters()
console.debug(filters)

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl)

onMounted(async () => {
	console.debug('onMounted')
	getMatches()
})

// TODO: call when checkboxes changed
function applyFilters() {
	getMatches()
}

/**
 * if includeScore gets set, ensure players will also be included
 * this is important because a score are tight to a player
 */
watchEffect(() => {
	if (filters.includeScores)
		filters.includePlayers = true
})

watchEffect(() => {
	if (filters.completed)
		filters.started = true
})

async function getMatches() {
	error.value = ''
	loading.value = true
	try {
		matches.value = await matchService.getMatches(filters)
		await new Promise(resolve => setTimeout(resolve, 1000)); // TODO: remove debug delay
		if (matches.value.length === 0)
			error.value = "No Matches found!"
	} catch (e: any) {
		console.debug(e)
		// if (e instanceof AxiosError)
		error.value = "Error while loading matches: " + e?.message + ' ' + e?.response?.statusText // TODO: provide nicer message

	}
	loading.value = false
}
const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults } =
	usePagination(matches)

const resultCount = computed(() => matches.value.length)
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
