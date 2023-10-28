<template>
    <li class="card">
      <h3>Match #{{ match.id }}</h3>
      <p v-if="match.players.length >= 1">
        <span v-if="match.players[0]">{{ match.players[0].name }}</span>
        <span v-else>???</span>
        vs
        <span v-if="match.players[1]">{{ match.players[1].name }}</span>
        <span v-else>???</span>
      </p>
      <p v-if="inProgress || isCompleted">
        {{ match.players[0].score }} : {{ match.players[1].score }}
      </p>
      <p id="match-time-since-end">{{ timeSinceEnd }}</p>
      <p v-if="inProgress || isCompleted">duration: {{ duration }}</p>
      <button v-if="canJoin" @click="join_game(match.id)" class="button join">Join Game</button>
    </li>
  </template>

<script setup lang="ts">
    import type { MatchMetaData } from '@/types/match'
    import TimeAgo from 'javascript-time-ago'
    import { computed, type PropType } from 'vue'

    const props = defineProps({
    match: {
        type: Object as PropType<MatchMetaData>,
        required: true
    },
    joinGame: {
        type: Function as PropType<(id: number) => void>,
        required: false
    }
    })

    const inProgress = computed(() => {
    if (props.match.end || !props.match.start) {
        return false
    }
    return true
    })

    const isCompleted = computed(() => {
    if (props.match.end) {
        return true
    }
    return false
    })

    const canJoin = computed(() => {
    if (inProgress.value || isCompleted.value) return false
    return true
    })

    const duration = computed(() => {
    if (!props.match.start) return undefined
    const start = props.match.start
    const end = props.match.end ?? new Date(Date.now())
    const duration = end.getTime() - start.getTime()
    const result = new Date(duration)
    return result.toUTCString().split(' ').slice(4, 5)[0]
    })

    const timeSinceEnd = computed(() => {
    if (!props.match.end) return
    const timeAgo = new TimeAgo('en-US')
    return timeAgo.format(props.match.end)
    })

    const join_game = props.joinGame as (id: number) => void

    // const highscore = computed(() => {
    //   return Math.max(props.match.players[0].score, props.match.players[1].score)
    // })
</script>

<style scoped>
    .card {
        background-color: darkgray;
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 20px;
        width: 200px;
        min-width: 200px;
        max-width: 300px;
        box-sizing: border-box;
        transition: transform 0.2s ease-in-out;
    }

    .card:hover {
        transform: translateY(-5px);
    }
</style>
