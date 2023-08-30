import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendsList from './src/components/user/friends/FriendsList.vue'
import ButtonApp from './src/components/ButtonApp.vue'

describe('FriendsList', () => {

  it('renders the component', () => {
    const wrapper = mount(FriendsList, {
		data() {
			return {
				friends: []
			}
		}
	})
    expect(wrapper.exists()).toBe(true)
  });


  it('displays "You dont have friends yet!" when there are no friends', async () => {
    const wrapper = mount(FriendsList, {
		data() {
			return {
				friends: []
			}
		}
	})
	await wrapper.vm.$nextTick()

	expect(wrapper.find('.friends div').text()).toBe("You dont have friends yet!")
  });

})
