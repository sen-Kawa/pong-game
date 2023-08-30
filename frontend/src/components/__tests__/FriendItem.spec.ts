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


  it('renders the "Status" button', () => {
	const friend = { displayName: 'John Leet'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const buttons = wrapper.findAll('button');
    expect(buttons[0].text()).toBe('Status')
  });


  it('renders the "Remove Friend" button', () => {
	const friend = { displayName: 'John Leet'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const buttons = wrapper.findAll('button');
    expect(buttons[1].text()).toBe('Remove Friend')
  });


  it('calls removeFriend() method when clicking on the "Remove Friend" button', async () => { 
	const friend = { displayName: 'John Leet', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	const removeFriendSpy = vi.spyOn(wrapper.vm, 'removeFriend');
    const buttons = wrapper.findAll('button');
	await buttons[1].trigger('click');
	expect(removeFriendSpy).toHaveBeenCalled();
  });


  it('calls deleteFriend() method with the correct displayName, URL, method, api and credentials', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
	const friend = { displayName: 'John Leet', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	await wrapper.vm.removeFriend();
	expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/users/removeFriend/', {
		method: 'DELETE',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ friendName: 'John Leet'})
	});
  });


  it('emits "friendRemoved" event after calling deleteFriend()', async () => { 
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(undefined)
	});
	const friend = { displayName: 'John Leet', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	await wrapper.vm.removeFriend();
    expect(wrapper.emitted('friendRemoved')).toBeTruthy();
  });


})
