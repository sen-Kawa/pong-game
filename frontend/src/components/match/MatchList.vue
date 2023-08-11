<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MatchItemVue from './MatchItem.vue'
import type { MatchResult } from '@/types/match'

import MatchService from '@/services/MatchService'

const matches = ref([] as MatchResult[])

onMounted(async () => {
  const baseUrl = import.meta.env.VITE_BACKEND_SERVER_URI
  const matchService: MatchService = new MatchService(baseUrl)

  matches.value = await matchService.getMatchHistory()
})
</script>

<template>
  <div class="match-list">
    <h2>Match List</h2>
    <ul>
      <MatchItemVue v-for="match in matches" :key="match.id" :match="match" />
    </ul>
  </div>
</template>
