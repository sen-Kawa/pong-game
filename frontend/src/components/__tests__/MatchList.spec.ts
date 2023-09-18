import { beforeAll, describe, expect, it } from 'vitest'

import MatchListVue from '@/components/match/MatchList.vue'
import type { MatchMetaData } from '@/types/match'
import { mount } from '@vue/test-utils'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

const fakeMatches: MatchMetaData[] = [
  { id: 1, players: [] },
  {
    id: 2,
    // start: new Date(Date.now()),
    players: [
      {
        id: 1,
        email: 'alice@exmaple.com',
        name: 'Alice',
        score: 0
      }
    ]
  }
]

beforeAll(() => {
  TimeAgo.addDefaultLocale(en)
})

describe('MatchList', () => {
  it('renders properly', async () => {
    const wrapper = mount(MatchListVue, {
      props: {
        matches: fakeMatches
      }
    })

    expect(wrapper.findAll('ul.match-list').length).toBe(1)
    expect(wrapper.findAll('ul.match-list > li').length).toBe(2)
  })
})
