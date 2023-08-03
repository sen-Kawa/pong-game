<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MatchItemVue from './MatchItem.vue';
import type { MatchResult } from '@/types/match';
import { AxiosError } from 'axios'

import MatchService from '@/services/MatchService'

const matches = ref([] as MatchResult[])
let loading = ref(false);
let error = ref("")

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
  const matchService: MatchService = new MatchService(baseUrl);

  loading.value = true
  try {
    matches.value = await matchService.getMatchHistory();
  } catch (e) {
    console.debug(e)
    if (e instanceof AxiosError)
      error.value = e.message + ' ' + e.response?.statusText // TODO: provide nicer message
  }
  loading.value = false
});

</script>

<template>
  <div class="match-list">
    <h2>Match List</h2>
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
