<template>
	<div>
		<h2>Find User</h2>
		<form @submit.prevent="findUser">
			<label for="name">Users's Name: </label>
				<input
					v-model="name"
					type="text"
					id="name">
				<button type="submit">Find</button>
		</form>
		<div v-if="foundUser.length > 0">
			<h3>User details</h3>
			<li v-for="userData in foundUser" :key="userData.userName">
				<p>{{ userData.displayName }} {{ userData.userName }}
				<AddFriend :friendName="userData.displayName" @friendAdded="onFriendAdded" /> </p>
			</li>
		</div>
		<div v-if="message" :class="messageType">{{ message }}</div>
	</div>
</template>

<script>
import AddFriend from './AddFriend.vue'
import { postFindUser } from './api/friendship.api.js';
export default {
	data() {
		return {
			name: "",
			message: "",
			messageType: "",
			foundUser: [],
		};
	},
	components: {
		AddFriend,
	},
	methods: {
		onFriendAdded() {
			try {
				this.$emit('onFriendAdded');
			} catch(error) {
				console.error('error emitting', error);
			}
		},
		async findUser() {
			if (!this.name) {
				alert('Add name to search')
				return
			}
			this.foundUser = [];
			const userData = await postFindUser(this.name);

			if (userData.length === 0) {
				this.message = `${this.name} not found.`;
				this.messageType = "error";
			}
			else {
				this.foundUser = userData;
				this.message = `Found ${this.name}`;
				this.messageType = "success";
			}
			this.name = ""
			setTimeout(() => {
				this.message = "";
			}, 5000);
		}
	},
};
</script>

<style>
.success {
	color: green;
}
.error {
	color: red;
}
</style>
