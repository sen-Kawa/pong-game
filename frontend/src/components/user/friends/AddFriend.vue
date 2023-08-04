<template>
	<div>
		<h2>Add Friend</h2>
		<form @submit.prevent="addFriend">
			<label for="friendName">Friend's Name:</label>
				<input
					v-model="friendName"
					type="text"
					id="friendName">
				<button type="submit">Add</button>
		</form>
		<div v-if="message" :class="messageType">{{ message }}</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			friendName: "",
			message: "",
			messageType: "",
		};
	},
	methods: {
		async addFriend() {
			if (!this.friendName) {
				alert('Add name to search')
				return
			}
			console.log(this.friendName);
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
			this.friendName = ""
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
