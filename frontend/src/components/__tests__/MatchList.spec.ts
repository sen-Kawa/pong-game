import { describe, it, expect, beforeAll } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import MatchListVue from '@/components/match/MatchList.vue'
import { Scope } from '@/services/MatchService'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

beforeAll(() => {
  TimeAgo.addDefaultLocale(en)
})

describe('MatchList', () => {
  it('renders properly', async () => {
    const wrapper = mount(MatchListVue, {
      props: {
        initialScope: Scope.global
      }
    })

    expect(wrapper.text()).toContain('Match List')

    await flushPromises() // wait for the promise to resolve

    expect(wrapper.text()).toContain('Match #1')
  })
})
