import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendItem from './src/components/user/friends/FriendItem.vue'
import {afterEach, beforeEach} from 'node:test';


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

  it('emits "friendRemoved" event after successfully deleting friend', async () => { 
	const friend = { displayName: 'John Leet', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	await wrapper.vm.removeFriend();
    expect(wrapper.emitted('friendRemoved')).toBeTruthy();
  });


  it('does not emit "friendRemoved" event after failed deleting friend', async () => { 
	const friend = { displayName: 'Mimi', id: 123 };
    const wrapper = mount(FriendItem, {
		props: { friend }
	});
	await wrapper.vm.removeFriend();
    expect(wrapper.emitted('friendRemoved')).toBeFalsy();
  });
})
