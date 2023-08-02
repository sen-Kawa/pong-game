<template>
    <div class="friends">
		<h1>Friends</h1>
		<ul v-if="friends.length">
			<li v-for="friend in friends" :key="friend">{{friend}}<button @click="removeFriend(friend)">Remove Friend</button></li>
		</ul>
		<div v-else>
			You dont have friends yet!
		</div>
		<Button text="Add Friend" color="LightGray" />
    </div>
</template>

<script>
import Button from '../../Button.vue'
export default {
	data() {
		return {
			friends: [],
		};
	},
	components: {
		Button
	},
	async created() {
		await this.fetchFriendList();
	},
	methods: {
		async fetchFriendList() {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/friends/`);
			const data = await response.json();
			this.friends = data;
			this.friends = [1, 2]; //for testing
		},
		async removeFriend(friendD) {
            //await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/removeFriend/`);
			this.friends = this.friends.filter(friend => friend !== friendD); //for testing
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
