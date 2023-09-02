<script setup lang="ts">
import type { MatchMetaData } from '@/types/match';
import { type PropType } from 'vue';
import MatchItemVue from './MatchItem.vue';

const props = defineProps({
  matches: {
    type: Array as PropType<MatchMetaData[]>,
    required: true
  }
})
</script>

<template>
  <div class="content">
    <ul v-if="matches.length" class="match-list">
      <MatchItemVue v-for="match in matches" :key="match.id" :match="match" />
    </ul>
  </div>
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
