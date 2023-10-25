<template>
  <div class="component-title">Leaderboard</div>
  <div class="table-container">
    <table>
      <thead class="component-subtitle">
        <tr>
          <td>Rank</td>
          <td>Name</td>
          <td>Win Rate</td>
        </tr>
      </thead>
      <tr class="details" v-for="(row, index) in leaderboard" :key="index">
        <td>{{ row.rank }}</td>
        <td>{{ row.displayName }}</td>
        <td>{{ getWinRateAsPercent(row.ratio) }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import jwtInterceptor from '@/interceptor/jwtInterceptor'
import { onMounted, ref } from 'vue'
const backendUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}`

interface LeaderboardRow {
  rank: number
  displayName: string
  ratio: number
}

const leaderboard = ref<LeaderboardRow[]>([])

async function getLeaderboard() {
  const response = await jwtInterceptor.get(backendUrl + '/statistics/leaderboard', {
    withCredentials: true
  })
  if (response && response.status == 200) {
    //console.table(response.data)
    leaderboard.value = response.data
  }
}

onMounted(async () => {
  await getLeaderboard()
})

function getWinRateAsPercent(ratio: number) {
  const percent = ratio * 100
  return percent.toFixed(2) + '%'
}
</script>

<style scoped>
.table-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

table {
  width: max-content;
  border-collapse: collapse;
}
</style>
