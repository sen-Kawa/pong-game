<script setup lang="ts">
import type { MatchResult } from '@/types/match';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { type PropType } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  match: {
    type: Object as PropType<MatchResult>,
    required: true
  }
});

TimeAgo.addDefaultLocale(en); // FIXME: only add once to avoid error, maybe move to main.ts?

const duration = computed(() => {
  const start = props.match.start;
  const end = props.match.end;
  const duration = end.getTime() - start.getTime();
  const result = new Date(duration);
  return result.toLocaleTimeString('de-DE', {
    timeStyle: 'medium'
  });
});

const timeSinceEnd = computed(() => {
  const timeAgo = new TimeAgo('en-US');
  return timeAgo.format(props.match.end);
});

const highscore = computed(() => {
  return Math.max(props.match.players[0].score, props.match.players[1].score);
});
</script>

<template>
  <li>
    <h3>Match #{{ match.id }}</h3>
    <p v-if="match.players">
      <!-- TODO: highlight the winner -->
      <span>{{ match.players[0].name }}</span> vs <span>{{ match.players[1].name }}</span>
    </p>
    <p v-if="match.players">{{ match.players[0].score }} : {{ match.players[1].score }}</p>
    <p id="match-time-since-end">{{ timeSinceEnd }}</p>
    <p>duration: {{ duration }}</p>
  </li>
</template>
