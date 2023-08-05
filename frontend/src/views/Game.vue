<template>
  <div class="text-center">
    this is the game tap
  </div>
  <MatchList :initial-scope="Scope.inProgress" />
</template>

<script setup lang="ts">
import { Scope } from "@/services/MatchService";
import MatchList from "@/components/match/MatchList.vue";
</script>
