import { describe, it, expect } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import MatchListVue from '@/components/match/MatchList.vue'

describe('MatchList', () => {
  it('renders properly', async () => {
    const wrapper = mount(MatchListVue)

    expect(wrapper.text()).toContain('Match List')

    await flushPromises() // wait for the promise to resolve

    expect(wrapper.text()).toContain('Match #1')
  })
})
