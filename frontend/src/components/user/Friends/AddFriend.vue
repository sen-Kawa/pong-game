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
		<h3 v-show="friendAdded">Friend added!</h3>
	</div>
</template>

<script>
export default {
	data() {
		return {
			friendName: "",
			friendAdded: false,
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
				this.friendAdded = !this.friendAdded
			}
			else {
				console.log("Error adding friend");
			}
			this.friendName = ""
		}
	},
}
</script>
