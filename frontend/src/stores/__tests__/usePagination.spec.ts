import { describe, expect, it, test } from 'vitest'
import { ref } from 'vue'
import usePagination from '../usePagination'

describe('usePagination', () => {
  const items = ['one', 'two', 'three', 'four', 'five', 'six', 'seven']
  // const {
  //   currentPage,
  //   nextPage,
  //   prevPage,
  //   currentStartIndex,
  //   currentEndIndex,
  //   pagedResults: pagedMatches
  // } = usePagination<String>(ref(items))

  it('should go to the next and previous pages', () => {
    const { currentPage, nextPage, prevPage } = usePagination<String>(ref(items), 5)

    expect(currentPage.value).toBe(1)

    nextPage()
    expect(currentPage.value).toBe(2)

    prevPage()
    expect(currentPage.value).toBe(1)
  })

  it('should not go to the previous page when on page 1', () => {
    const { currentPage, prevPage } = usePagination<String>(ref(items), 5)

    expect(currentPage.value).toBe(1)

    prevPage()
    expect(currentPage.value).toBe(1)
  })

  it('should not got to the next page when there is none', () => {
    const { currentPage, nextPage } = usePagination<String>(ref(items), 5)

    currentPage.value = 2

    nextPage()
    expect(currentPage.value).toBe(2)
  })

  it('should return the correct start and end indices', () => {
    const { currentPage, currentStartIndex, currentEndIndex } = usePagination<String>(ref(items), 5)

    currentPage.value = 1

    expect(currentStartIndex.value).toBe(1)
    expect(currentEndIndex.value).toBe(5)

    currentPage.value = 2
    expect(currentStartIndex.value).toBe(6)
    expect(currentEndIndex.value).toBe(7)
  })

  test.each([2, 5, 10])('should split the list into pages of size %i', (pageSize: number) => {
    const { pagedResults } = usePagination<String>(ref(items), pageSize)
    expect(pagedResults.value.length).lessThanOrEqual(pageSize)
  })

  test.fails('should not accept a negative page size', () => {
    usePagination<String>(ref(items), -5)
  })

  test.fails('should not accept zero as page size', () => {
    usePagination<String>(ref(items), 0)
  })

  test('empty list', () => {
    // const empty: = []
    const { currentPage, nextPage, prevPage, currentStartIndex, currentEndIndex, pagedResults } =
      usePagination(ref([]), 5)

    expect(currentPage.value).toBe(1)
    expect(pagedResults.value.length).toBe(0)
    expect(currentStartIndex.value).toBe(0)
    expect(currentEndIndex.value).toBe(0)
  })
})
