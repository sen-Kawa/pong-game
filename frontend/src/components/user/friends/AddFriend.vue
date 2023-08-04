<template>
	<button @click="addFriend">Add Friend</button>
	<div v-if="message" :class="messageType">{{ message }}</div>
</template>

<script>
export default {
	props: {
		friendName: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			message: "",
			messageType: "",
		};
	},
	emits: ['friendAdded'],
	methods: {
		async addFriend() {
			const requestOptions = {
				method: "POST",
				credentials: "include",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ friendName: this.friendName }),
			};
            const response = await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/addFriend/`, requestOptions);
			if (response.ok) {
				this.message = `Successfully added ${this.friendName} to your friend list!`;
				this.messageType = "success";
				this.$emit('friendAdded');
			}
			else {
				const responseData = await response.json();
				this.message = responseData.message || `Failed to add ${this.friendName} to your friend list.`;
				this.messageType = "error";
			}
			setTimeout(() => {
				this.message = "";
			}, 5000);
		}
	},
}
</script>

<style>
.success {
	color: green;
}
.error {
	color: red;
}
</style>
