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
			const requestOptions = {
				method: "POST",
				credentials: "include",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: this.name }),
			};
            const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/find/`, requestOptions);
			console.log('API RESPONSE:', response);
			
			if (response.ok) {
				const userData = await response.json();
				this.foundUser = userData;
				this.message = `Found ${this.name}`;
				this.messageType = "success";
			}
			else {
				this.message = `${this.name} not found.`;
				this.messageType = "error";
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
