import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FindUser from './src/components/user/friends/FindUser.vue'
import AddFriend from './src/components/user/friends/AddFriend.vue'
import { postFindUser } from './src/components/user/friends/api/friendship.api'

describe('FindUser', () => {

  it('renders the component', () => {
    const wrapper = mount(FindUser)
    expect(wrapper.exists()).toBe(true)
  });


  it('renders the "Find" button', () => {
    const wrapper = mount(FindUser)
	const button = wrapper.find('button')
	expect(button.text()).toBe('Find')
  });


  it('calls findUser() method based on a search with input value from user', async () => {
	const FindUserSpy = vi.spyOn(FindUser.methods, 'findUser') 
    const wrapper = mount(FindUser)
	const input = wrapper.find('input');
	await input.setValue('bobb');
	await wrapper.find('form').trigger('submit.prevent');
	await wrapper.vm.$nextTick();
	expect(FindUserSpy).toHaveBeenCalled();
  });


  it('displays display name and user name when match found based on userName search', async () => {
	const foundUserData = [
		{
			displayName: 'Bobu',
			userName: 'bobby',
		},
	];
    const wrapper = mount(FindUser, {
		data() {
			return {
				foundUser: foundUserData
			}
		}
	})
	const input = wrapper.find('input');
	await input.setValue('bobb');
	await wrapper.find('form').trigger('submit.prevent');
	await wrapper.vm.$nextTick();
	const userDetails = wrapper.findAll('li');
	expect(userDetails.length).toBe(1);
	expect(userDetails[0].text()).toContain('Bobu');
	expect(userDetails[0].text()).toContain('bobby');
  });


  it('displays display name and user name when match found based on displayName search', async () => {
	const foundUserData = [
		{
			displayName: 'Bobu',
			userName: 'bobby',
		},
	];
    const wrapper = mount(FindUser, {
		data() {
			return {
				foundUser: foundUserData
			}
		}
	})
	const input = wrapper.find('input');
	await input.setValue('Bob');
	await wrapper.find('form').trigger('submit.prevent');
	await wrapper.vm.$nextTick();
	const userDetails = wrapper.findAll('li');
	expect(userDetails.length).toBe(1);
	expect(userDetails[0].text()).toContain('Bobu');
	expect(userDetails[0].text()).toContain('bobby');
  });


  it('finds multiple user matches', async () => {
	const foundUserData = [
		{
			displayName: 'Bobu',
			userName: 'bobby',
		},
		{
			displayName: 'Bobardo',
			userName: 'bobba',
		},
	];
    const wrapper = mount(FindUser, {
		data() {
			return {
				foundUser: foundUserData
			}
		}
	})
	const input = wrapper.find('input');
	await input.setValue('bobb');
	await wrapper.find('form').trigger('submit.prevent');
	await wrapper.vm.$nextTick();
	const userDetails = wrapper.findAll('li');
	expect(userDetails.length).toBe(2);
	expect(userDetails[0].text()).toContain('Bobu');
	expect(userDetails[1].text()).toContain('Bobardo');
  });


  it('shows alert and prompts for a input value when user search is empty', async () => {
    const wrapper = mount(FindUser);
	const alertSpy = vi.spyOn(window, 'alert');
	window.alert = () => {};
	await wrapper.find('form').trigger('submit.prevent');
	expect(alertSpy).toHaveBeenCalledWith('Add name to search')
  });


  it('emits onFriendAdded when AddFriend child component adds a friend', async () => {
	const foundUserData = [
		{
			displayName: 'Bobu',
			userName: 'bobby',
		},
	];
    const wrapper = mount(FindUser, {
		data() {
			return {
				foundUser: foundUserData
			}
		},
		components: {
			AddFriend,
		},
	})
	const friendComponent = wrapper.findComponent({ name: 'AddFriend' });
	await friendComponent.vm.$emit('friendAdded');
	await wrapper.vm.$nextTick();
	expect(wrapper.emitted('onFriendAdded')).toBeTruthy();
  });


  it('gives an error message if user not found', async () => {
	const fetchMock = vi.spyOn(window, 'fetch');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce({})
	});
    const wrapper = mount(FindUser, {
		data() {
			return {
				name: 'Mimi',
				foundUser: []
			}
		},
		components: {
			AddFriend,
		},
	})
	await wrapper.vm.findUser();
	await wrapper.vm.$nextTick();
	expect(wrapper.vm.message).toBe('Mimi not found.')
	expect(wrapper.vm.messageType).toBe('error')
  });


  it('succesfull message and message type', async () => {
	const foundUserData = [
		{
			data: [{
				displayName: 'Bobu',
				userName: 'bobby',
			}],
		},
	]
	const fetchMock = vi.spyOn(window, 'jwtInterceptor.post');
	fetchMock.mockResolvedValue({
		status: 200,
		json: vi.fn().mockResolvedValueOnce(foundUserData)
	});

    const wrapper = mount(FindUser, {
		data() {
			return {
				name: 'bobb',
			}
		}
	})
	await wrapper.vm.findUser();
	expect(wrapper.vm.message).toBe('Found bobb')
	expect(wrapper.vm.messageType).toBe('success')
  });

})
