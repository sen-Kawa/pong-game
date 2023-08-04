<template>
    <div class="friend-item">
		<span class="friend-name">{{friend.displayName}}</span>
		<button>Status</button>
		<button @click="removeFriend">Remove Friend</button>
	</div>
</template>

<script>

import { deleteFriend } from './api/friendship.api.js';

export default {
	props: {
		friend: {
			type: Object,
			required: true,
		},
	},
	methods: {
		async removeFriend() {
			deleteFriend(friend.displayName);
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
