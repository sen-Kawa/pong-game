<script setup lang="ts">
import { Scope, useMatchStore } from '@/stores/match'
import { onMounted, ref } from 'vue'
import LoadingIndicator from '../match/LoadingIndicator.vue'
import MatchList from '../match/MatchList.vue'

interface Props {
  initialScope: Scope
}

const props = withDefaults(defineProps<Props>(), {
  initialScope: Scope.global
})

const scope = ref(props.initialScope)
const matchStore = useMatchStore()

matchStore.init()

function toggleScope() {
  matchStore.matches = []
  if (scope.value === Scope.global) scope.value = Scope.personal
  else if (scope.value === Scope.personal) scope.value = Scope.global
  matchStore.getMatchHistory(scope.value)
}

onMounted(() => {
  matchStore.getMatchHistory(scope.value)
})

</script>

<template>
  <h2 class="component-title">{{ Scope[scope] }} MatchHistory</h2>
  <button @click="toggleScope">Switch Scope</button>
  <LoadingIndicator :is-loading="matchStore.loading" :error="matchStore.error">
    <MatchList :matches="matchStore.matches" :joinGame="(id: number) =>{}"/>
  </LoadingIndicator>
</template>

