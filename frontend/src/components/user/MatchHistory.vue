<script setup lang="ts">
import { Scope } from '@/services/MatchService'
import MatchList from '@/components/match/MatchList.vue'
import SearchMatch from '@/components/match/SearchMatch.vue';
</script>

<template>
  <div class="text-center">this is the MatchHistory tap</div>
  <SearchMatch />
  <MatchList :initialScope="Scope.personal" />
</template>
