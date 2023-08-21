import { onMounted, reactive, ref } from 'vue'

export default function useFilters() {
  const filters = reactive({
    started: true,
    completed: false,
    includePlayers: true,
    includeScores: true
  })

  onMounted(() => console.log('Mounted: useFilters'))

  const clearFilters = () => {
    for (const key in filters) {
      filters[key as keyof typeof filters] = false // https://stackoverflow.com/a/69198602
    }
  }

  return {
    filters,
    clearFilters
  }
}
