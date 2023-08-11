import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import MatchItemVue from '@/components/match/MatchItem.vue'

describe('MatchItemItem', () => {
  it('renders properly', () => {
    const currentTime = new Date()
    const futureTime = new Date()
    futureTime.setHours(currentTime.getHours() + 1) // add one hour

    const wrapper = mount(MatchItemVue, {
      props: {
        match: {
          id: 1,
          completed: true,
          start: currentTime,
          end: futureTime,
          players: [
            {
              id: 1,
              score: 4,
              name: 'Marty',
              email: 'marty@example.com'
            },
            {
              id: 2,
              score: 0,
              name: 'Chris',
              email: 'chelmerd@example.com'
            }
          ]
        }
      }
    })

    expect(wrapper.text()).toContain('Match #1')
    expect(wrapper.text()).toContain('Marty vs Chris')
    expect(wrapper.text()).toContain('4 : 0')
    expect(wrapper.text()).toContain('in 1 hour')
    // expect(wrapper.text()).toContain('start: ');
    // expect(wrapper.text()).toContain('end: ');
  })
})
