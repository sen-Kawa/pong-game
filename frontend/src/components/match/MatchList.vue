<script setup lang="ts">
import type { MatchResult } from '@/types/match'
import { AxiosError } from 'axios'
import { onMounted, ref, type PropType } from 'vue'
import MatchItemVue from './MatchItem.vue'

import MatchService, { Scope } from '@/services/MatchService'
import LoadingIndicator from './LoadingIndicator.vue'

const props = defineProps({
  initialScope: {
    type: Number as PropType<Scope>,
    required: true
  }
})
const scope = ref(props.initialScope) // maybe emit an event and let the parent change it

const matches = ref([] as MatchResult[])
let loading = ref(false)
let error = ref('')

async function getMatches() {
  console.debug('getMatches scope ' + scope.value)

  const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
  const matchService: MatchService = new MatchService(baseUrl)

  loading.value = true
  try {
    if (scope.value === Scope.inProgress) matches.value = await matchService.getInProgressMatches()
    else matches.value = await matchService.getMatchHistory(scope.value)
  } catch (e) {
    console.debug(e)
    if (e instanceof AxiosError) error.value = e.message + ' ' + e.response?.statusText // TODO: provide nicer message
  }
  loading.value = false
}

function toggleScope() {
  matches.value = []
  if (scope.value === Scope.global) scope.value = Scope.personal
  else if (scope.value === Scope.personal) scope.value = Scope.global
  getMatches()
}

onMounted(async () => {
  console.debug('onMounted')
  getMatches()
})
</script>

<template>
  <h2>{{ Scope[scope] }} Match List</h2>
  <LoadingIndicator :is-loading="loading" :error="error">

    <button @click="toggleScope" v-if="scope !== Scope.inProgress">Switch Scope</button>

    <div class="content">
      <ul v-if="matches" class="match-list">
        <MatchItemVue v-for="match in matches" :key="match.id" :match="match" />
      </ul>
    </div>
  </LoadingIndicator>
</template>

<style scoped>
.content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.match-list {
  list-style: none;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  padding: 0;
  gap: 7px;
}
</style>
