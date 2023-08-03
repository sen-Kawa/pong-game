<template>
    <div class="friend-item">
		<span class="friend-name">{{friend.displayName}}</span>
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
	.friend-item {
		display: flex;
	}
	.friend-name {
		font-weight: bold;
		margin-right: 10px;
		font-size: 20px;
	}
	div.friends {
		#display: flex;
		#justify-content: space-between;
		#align-items: center;
	}
</style>
