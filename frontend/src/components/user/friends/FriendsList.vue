<template>
    <div class="friends">
		<h1>Friends</h1>
		<ul v-if="friends.length">
			<Friend v-for="friend in friends" :key="friend.id" :friend="friend" @friendRemoved="onFriendRemoved" />
		</ul>
		<div v-else>
			You dont have friends yet!
		</div>
		<ButtonC @btn-click="toggleShowAddFriend()"
			:text="showAddFriend ? 'Close' : 'Add Friend'"
			color="LightGray" />
		<AddFriend v-show="showAddFriend" @friendAdded="onFriendAdded" />
    </div>
</template>

<script>
import ButtonC from '../../Button.vue'
import AddFriend from './AddFriend.vue'
import Friend from './FriendItem.vue'
export default {
	data() {
		return {
			showAddFriend: false,
			friends: [],
		};
	},
	components: {
		ButtonC,
		AddFriend,
		Friend,
	},
	mounted() {
		this.fetchFriendList();
	},
	methods: {
		toggleShowAddFriend() {
			this.showAddFriend = !this.showAddFriend
		},
		onFriendAdded() {
			this.fetchFriendList();
		},
		onFriendRemoved() {
			this.fetchFriendList();
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
