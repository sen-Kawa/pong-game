<template>
    <div>
		<span>{{friend.displayName}}</span>
		<button @click="removeFriend">Remove Friend</button>
	</div>
</template>

<script>
export default {
	props: {
		friend: {
			type: Object,
			required: true,
		},
	},
	methods: {
		async removeFriend() {
			const requestOptions = {
				method: "DELETE",
				credentials: "include",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ friendName: this.friend.displayName })
			};
            await fetch(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/removeFriend/`, requestOptions);
			this.$emit('friendRemoved', this.friend.id);
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
