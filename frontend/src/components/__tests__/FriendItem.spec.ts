import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendItem from './src/components/user/friends/FriendItem.vue'

describe('FriendItem', () => {

  it('renders the component', () => {
	const friend = { displayName: 'John Leet'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    expect(wrapper.exists()).toBe(true)
  });


  it('renders the friend\'s display name', () => {
	const friend = { displayName: 'John Leet'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const displayName = wrapper.find('.friend-name');
    expect(displayName.text()).toBe('John Leet');
  });

///////////////////////
  it('updates message and messageType after succesfully adding friend', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
	const wrapper = mount(FriendItem, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
	await wrapper.vm.addFriend();
    expect(wrapper.vm.message).toBe('Successfully added Nicole to your friend list!');
    expect(wrapper.vm.messageType).toBe('success')
  });


  it('emits "friendAdded" event after succesfully adding friend', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
	const wrapper = mount(FriendItem, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
	await wrapper.vm.addFriend();
    expect(wrapper.emitted('friendAdded')).toBeTruthy();
  });


  it('updates message and messageType after friend not found', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 404,
		json: vi.fn().mockResolvedValueOnce({ data: 'User not found' })
	});
	const wrapper = mount(FriendItem, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
	await wrapper.vm.addFriend();
    expect(wrapper.vm.message).toBe('Failed to add Nicole to your friend list.');
    expect(wrapper.vm.messageType).toBe('error')
  });


  it('updates message and messageType after adding friend forbidden', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 403,
		json: vi.fn().mockResolvedValueOnce({ data: "Can't add yourself!" })
	});
	const wrapper = mount(FriendItem, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
	await wrapper.vm.addFriend();
    expect(wrapper.vm.message).toBe('Failed to add Nicole to your friend list.');
    expect(wrapper.vm.messageType).toBe('error')
  });
})
