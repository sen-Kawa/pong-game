import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddFriend from './src/components/user/friends/AddFriend.vue'
import ButtonApp from './src/components/ButtonApp.vue'

describe('AddFriend', () => {

  it('renders the component', () => {
    const wrapper = mount(AddFriend, {
		props: {
			friendName: 'Nicole'
		}
	})
    expect(wrapper.exists()).toBe(true)
  });


  it('renders the "Add Friend" button', () => {
    const wrapper = mount(AddFriend, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
    const addButton = wrapper.find('button');
    expect(addButton.text()).toBe('Add Friend')
  });


  it('updates message and messageType after succesfully adding friend', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
	const wrapper = mount(AddFriend, {
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
	const wrapper = mount(AddFriend, {
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
	const wrapper = mount(AddFriend, {
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
	const wrapper = mount(AddFriend, {
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
