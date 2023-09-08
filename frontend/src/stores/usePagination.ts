import { computed, ref, type Ref } from 'vue'

export default function usePagination<Type>(items: Ref<Type[]>, pageSize: Ref<number>) {
  if (pageSize.value <= 0) throw new Error('pageSize has to be positive')
  const currentPage = ref(1)

  const nextPage = () => {
    if (currentStartIndex.value + pageSize.value > items.value.length) return
    currentPage.value += 1
  }
  const prevPage = () => {
    if (currentPage.value == 1) return
    currentPage.value -= 1
  }

  const currentStartIndex = computed(() => {
    if (items.value.length == 0) return 0
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const currentEndIndex = computed(() => {
    const end = currentStartIndex.value - 1 + pageSize.value
    return end > items.value.length ? items.value.length : end
  })

  const pagedResults = computed(() => {
    const startIndex = currentStartIndex.value - 1
    const endIndex = currentEndIndex.value
    return items.value.slice(startIndex, endIndex)
  })

  return {
    currentPage,
    nextPage,
    prevPage,
    pageSize,
    currentStartIndex,
    currentEndIndex,
    pagedResults
  }
}
