<script setup lang="ts">
import { ref, type PropType, onBeforeMount, onMounted } from 'vue';
import MatchItemVue from './MatchItem.vue';
import type { MatchDTO, MatchResult } from '@/types/match';
import { AxiosError } from 'axios'

import MatchService, { Scope } from '@/services/MatchService'

const props = defineProps({
  initialScope: {
    type: Number as PropType<Scope>,
    required: true,
  }
});
const scope = ref(props.initialScope) // maybe emit an event and let the parent change it

const matches = ref([] as MatchResult[] | MatchDTO[])
let loading = ref(false);
let error = ref("")

async function getMatches() {
  console.debug('getMatches scope ' + scope.value)

  const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
  const matchService: MatchService = new MatchService(baseUrl);

  loading.value = true
  try {
    if (scope.value === Scope.inProgress)
      matches.value = await matchService.getInProgressMatches()
    else
      matches.value = await matchService.getMatchHistory(scope.value);
  } catch (e) {
    console.debug(e)
    if (e instanceof AxiosError)
      error.value = e.message + ' ' + e.response?.statusText // TODO: provide nicer message
  }
  loading.value = false
}

function toggleScope() {
  matches.value = []
  if (scope.value === Scope.global)
    scope.value = Scope.personal
  else if (scope.value === Scope.personal)
    scope.value = Scope.global
  getMatches();
}

onMounted(async () => {
  console.debug('onMounted')
  getMatches();
})

</script>

<template>
  <div class="match-list">
    <h2>{{ Scope[scope] }} Match List</h2>

    <button @click="toggleScope" v-if="scope !== Scope.inProgress">Switch Scope</button>

    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <ul v-if="matches" class="content">
      <MatchItemVue v-for="match in matches" :key="match.id" :match="match" />
    </ul>
  </div>
</template>
