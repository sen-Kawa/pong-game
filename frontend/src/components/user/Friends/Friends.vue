<template>
    <div class="friends">
		<h1>Friends</h1>
		<ul v-if="friends.length">
			<li v-for="friend in friends" :key="friend.id">{{friend.displayName}}
				<button @click="removeFriend(friend)">Remove Friend</button></li>
		</ul>
		<div v-else>
			You dont have friends yet!
		</div>
		<Button @btn-click="toggleShowAddFriend()"
			:text="showAddFriend ? 'Close' : 'Add Friend'"
			color="LightGray" />
		<AddFriend v-show="showAddFriend" />
    </div>
</template>

<script>
import Button from '../../Button.vue'
import AddFriend from './AddFriend.vue'
export default {
	data() {
		return {
			showAddFriend: false,
			friends: [],
		};
	},
	components: {
		Button,
		AddFriend,
	},
	async created() {
		await this.fetchFriendList();
	},
	methods: {
		toggleShowAddFriend() {
			this.showAddFriend = !this.showAddFriend
		},
		async fetchFriendList() {
			const requestOptions = {
				method: "GET",
				credentials: "include"
			};
            const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/friends/`, requestOptions);
			const data = await response.json();
			this.friends = data;
		},
		async removeFriend(friend) {
			const requestOptions = {
				method: "DELETE",
				credentials: "include",
				body: JSON.stringify({ friendName: friend.displayName })
			};
            await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/removeFriend/`, requestOptions);
			this.friends = this.friends.filter(friend => friend.id !== friend.id);
		}
	}
}
</script>

<style scoped>
	div.friends {
		#display: flex;
		#justify-content: space-between;
		#align-items: center;
	}
</style>
