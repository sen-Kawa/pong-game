import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AddFriend from '@/components/user/friends/AddFriend.vue'

describe('AddFriend', () => {
  it('renders the component', () => {
    const wrapper = mount(AddFriend)
    expect(wrapper.exists()).toBe(true)
  })
})
