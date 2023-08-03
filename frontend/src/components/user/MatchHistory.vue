<script setup lang="ts">
import MatchListVue from '@/components/match/MatchList.vue';
import { Scope } from '@/services/MatchService'
</script>

<template>
  <div class="text-center">
    this is the MatchHistory tap
  </div>
  <MatchListVue :initialScope="Scope.personal" />
</template>
