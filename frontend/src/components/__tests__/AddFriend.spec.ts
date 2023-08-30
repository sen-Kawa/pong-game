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


  it('calls addFriend() method when clicking on the "Add Friend" button', async () => { 
    const wrapper = mount(AddFriend, {
		components: {
			ButtonApp
		},
		props: {
			friendName: 'Nicole'
		}
	});
	const addFriendSpy = vi.spyOn(wrapper.vm, 'addFriend');
    const button = wrapper.find('button');
	await button.trigger('click');
	expect(addFriendSpy).toHaveBeenCalled();
  });


  it('calls postAddFriend() method with the correct displayName, URL, method, api and credentials', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
    const wrapper = mount(AddFriend, {
		props: {
			friendName: 'Nicole'
		}
	})
	await wrapper.vm.addFriend();
	expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/users/addFriend/', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ friendName: 'Nicole'})
	});
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


  it('does not emit "friendAdded" event after failed adding friend', async () => { 
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
    expect(wrapper.emitted('friendAdded')).toBeFalsy();
  });
})
