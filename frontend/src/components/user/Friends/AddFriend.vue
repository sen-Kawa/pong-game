<template>
	<div>
		<h2>Add Friend</h2>
		<form @submit.prevent="addFriend">
			<input v-model="searchTerm" type="text" placeholder="Input name">
			<button type="submit">Add</button>
		</form>
		<h3 v-show="friendAdded">Friend added!</h3>
	</div>
</template>

<script>
export default {
	data() {
		return {
			searchTerm: '',
			friendAdded: false,
		};
	},
	methods: {
		async addFriend() {
			if (!this.searchTerm) {
				alert('Add name to search')
				return
			}
			this.friendAdded = !this.friendAdded
		}
	}
}
</script>
