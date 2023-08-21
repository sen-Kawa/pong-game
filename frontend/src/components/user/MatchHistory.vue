<script setup lang="ts">
import MatchList from '@/components/match/MatchList.vue';
import SearchMatch from '@/components/match/SearchMatch.vue';
import MatchService, { Scope } from '@/services/MatchService';
import type { MatchResult } from '@/types/match';
import { onMounted, ref } from 'vue';
import LoadingIndicator from '../match/LoadingIndicator.vue';

interface Props {
  initialScope: Scope
}

const props = withDefaults(defineProps<Props>(),
  {
    initialScope: Scope.global
  })

const scope = ref(props.initialScope)
const loading = ref(false)
const error = ref('')
const matches = ref([] as MatchResult[])

const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
const matchService: MatchService = new MatchService(baseUrl)

async function getMatches() {
  console.debug('getMatches scope ' + Scope[scope.value])

  error.value = ''
  loading.value = true
  try {
    matches.value = await matchService.getMatchHistory(scope.value)
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

function toggleScope() {
  matches.value = []
  if (scope.value === Scope.global) scope.value = Scope.personal
  else if (scope.value === Scope.personal) scope.value = Scope.global
  getMatches()
}

onMounted(() => {
  console.debug('onMounted MatchHistory')
  getMatches()
})
</script>

<template>
  <h2>{{ Scope[scope] }} MatchHistory</h2>
  <button @click="toggleScope">Switch Scope</button>
  <LoadingIndicator :is-loading="loading" :error="error">
    <MatchList :matches="matches" />
  </LoadingIndicator>
  <SearchMatch />
</template>
