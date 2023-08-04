<template>
	<button @click="addFriend">Add Friend</button>
	<div v-if="message" :class="messageType">{{ message }}</div>
</template>

<script>
import { postAddFriend } from './api/friendship.api.js';
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
			const responseData = await postAddFriend(this.friendName);

			if (responseData === undefined) {
				this.message = `Successfully added ${this.friendName} to your friend list!`;
				this.messageType = "success";
				this.$emit('friendAdded');
			}
			else {
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
