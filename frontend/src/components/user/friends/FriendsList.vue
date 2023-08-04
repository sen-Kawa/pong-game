<template>
    <div class="friends">
		<h1>Friends</h1>
		<ul v-if="friends.length">
			<Friend v-for="friend in friends" :key="friend.id" :friend="friend" @friendRemoved="onFriendRemoved" />
		</ul>
		<div v-else>
			You dont have friends yet!
		</div>
		<ButtonC @btn-click="toggleShowFindUser()"
			:text="showFindUser ? 'Close' : 'Find User'"
			color="LightGray" />
		<FindUser v-show="showFindUser" @onFriendAdded="onFriendAdded"/>
    </div>
</template>

<script>
import ButtonC from '../../Button.vue'
import Friend from './FriendItem.vue'
import FindUser from './FindUser.vue'
export default {
	data() {
		return {
			showFindUser: false,
			friends: [],
		};
	},
	components: {
		ButtonC,
		Friend,
		FindUser,
	},
	mounted() {
		this.fetchFriendList();
	},
	methods: {
		toggleShowFindUser() {
			this.showFindUser = !this.showFindUser
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
