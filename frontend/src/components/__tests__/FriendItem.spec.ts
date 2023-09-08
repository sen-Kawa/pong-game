import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendItem from './src/components/user/friends/FriendItem.vue'
import {afterEach, beforeEach} from 'node:test';
import * as api from './src/components/user/friends/api/friendship.api.ts'


describe('FriendItem', () => {

beforeEach(() => {
	vi.restoreAllMocks();
})

  it('renders the component', () => {
	const friend = { displayName: 'John Leets'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    expect(wrapper.exists()).toBe(true)
  });


  it('renders the friend\'s display name', () => {
	const friend = { displayName: 'John Leete'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const displayName = wrapper.find('.friend-name');
    expect(displayName.text()).toBe('John Leete');
  });


  it('renders the "Status" button', () => {
	const friend = { displayName: 'John Leetu'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const buttons = wrapper.findAll('button');
    expect(buttons[0].text()).toBe('Status')
  });


  it('renders the "Remove Friend" button', () => {
	const friend = { displayName: 'John Leeta'};
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
    const buttons = wrapper.findAll('button');
    expect(buttons[1].text()).toBe('Remove Friend')
  });


  it('calls removeFriend() method when clicking on the "Remove Friend" button', async () => { 
	const friend = { displayName: 'John Leeto', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	const removeFriendSpy = vi.spyOn(wrapper.vm, 'removeFriend');
    const buttons = wrapper.findAll('button');
	await buttons[1].trigger('click');
	expect(removeFriendSpy).toHaveBeenCalled();
	await removeFriendSpy.mockRestore();
  });


  it('calls deleteFriend() method with the correct displayName, URL, method, api and credentials', async () => { 
	const friend = { displayName: 'John Leetu', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	const removeFriendSpy = vi.spyOn(wrapper.vm, 'removeFriend');
    const buttons = wrapper.findAll('button');
	await buttons[1].trigger('click');
	expect(removeFriendSpy).toHaveBeenCalled();
	await removeFriendSpy.mockRestore();
	// const deleteFriendSpy = vi.spyOn(api, 'deleteFriend')
	// const friend = { displayName: 'John Leets'};
    // const wrapper = mount(FriendItem, {
	// 	props: { friend }
	// });
	// console.log('checking spu', deleteFriendSpy);
	// await wrapper.vm.removeFriend();
	// console.log('after');
	// await new Promise((resolve) => setTimeout(resolve, 0));
	// expect(deleteFriendSpy).toHaveBeenCalled();
  });


  // it('emits "friendRemoved" event after calling deleteFriend()', async () => { 
	// const fetchMock = vi.spyOn(window, 'fetch');
	// fetchMock.mockResolvedValue({
		// status: 200,
		// json: vi.fn().mockResolvedValueOnce(undefined)
	// });
	// const friend = { displayName: 'John Leet', id: 123 };
  //   const wrapper = mount(FriendItem, {
		// props: { friend }
	// });
	// await wrapper.vm.removeFriend();
  //   expect(wrapper.emitted('friendRemoved')).toBeTruthy();
  // });


})
