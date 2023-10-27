import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendsList from '@/components/user/friends/FriendsList.vue'
import Friend from '@/components/user/friends/FriendItem.vue'
import FindUser from '@/components/user/friends/FindUser.vue'
import ButtonApp from '@/components/ButtonApp.vue'

describe('FriendsList', () => {

  it('renders the component', () => {
    const wrapper = mount(FriendsList)
    expect(wrapper.exists()).toBe(true)
  });


  it('fetches the friend list on mount', () => {
	const fetchListSpy = vi.spyOn(FriendsList.methods as any, 'fetchFriendList');
    mount(FriendsList);
	expect(fetchListSpy).toHaveBeenCalled();
  });


  it('displays "You dont have friends yet!" when there are no friends', async () => {
    const wrapper = mount(FriendsList)
	await wrapper.vm.$nextTick()

	expect(wrapper.find('.friends div').text()).toBe("You dont have friends yet!")
  });


  it('displays friends names when there are existing friends and has the correct length of friends object', async () => {
	const friends = [
		{"displayName":"Alice", "id":1},{"displayName":"Mary", "id":2}
	];
    const wrapper = mount(FriendsList, {
		data() {
			return {
				friends: friends
			}
		}
	})
	await wrapper.vm.$nextTick()
	const friendElements = wrapper.findAll('.displayName')
	expect(friendElements.length).toBe(2)
	expect(friendElements[0].text()).toBe('Alice')
	expect(friendElements[1].text()).toBe('Mary')
  });


  it('toggles the showFindUser flag on button click', async () => {
    const wrapper = mount(FriendsList);
	expect(wrapper.vm.showFindUser).toBe(false);
  	const button = wrapper.find('button');
	await button.trigger('click');
	expect(wrapper.vm.showFindUser).toBe(true);
	await button.trigger('click');
	expect(wrapper.vm.showFindUser).toBe(false);
  });
  

  it('displays "Find User" or "Close" text on button based on showFindUser flag', async () => {
    const wrapper = mount(FriendsList);
  	const button = wrapper.find('button');
	expect(button.text()).toBe('Find User');
	await button.trigger('click');
	expect(button.text()).toBe('Close');
  });


  it('onFriendRemoved() method called when friend removed in child component FriendItem.vue and fetches the friend list', async () => {
	const onFriendRemovedSpy = vi.spyOn(FriendsList.methods as any, 'onFriendRemoved');
	const fetchListSpy = vi.spyOn(FriendsList.methods as any, 'fetchFriendList');
	const friends = [{ displayName: "Alice", "id":1 }];
    const wrapper = mount(FriendsList, {
		data() {
			return {
				friends: friends
			}
		},
		components: {
			ButtonApp,
			Friend,
			FindUser
		}
	})
	const friendComponent = wrapper.findComponent({ name: 'Friend' });
	await friendComponent.vm.$emit('friendRemoved');
	expect(onFriendRemovedSpy).toHaveBeenCalled();
	expect(fetchListSpy).toHaveBeenCalled();
  });


  it('onFriendAdded() method called when friend added in child component FindUser.vue and fetches the friend list', async () => {
	const onFriendAddedSpy = vi.spyOn(FriendsList.methods as any, 'onFriendAdded');
	const fetchListSpy = vi.spyOn(FriendsList.methods as any, 'fetchFriendList');
    const wrapper = mount(FriendsList, {
		data() {
			return {
				friends: []
			}
		},
		components: {
			ButtonApp,
			Friend,
			FindUser
		}
	})
	const findUserComponent = wrapper.findComponent({ name: 'FindUser' });
	await findUserComponent.vm.$emit('onFriendAdded');
	expect(onFriendAddedSpy).toHaveBeenCalled();
	expect(fetchListSpy).toHaveBeenCalled();
  });
})
