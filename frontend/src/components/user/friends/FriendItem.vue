<template>
	<tr>
		<td class="displayName details">{{ friend.displayName }}</td>
		<td class="userName details">{{ friend.userName }}</td>
		<td class="status details">{{ friend.currentStatus }}</td>
		<td><img class="avatar" :src="avatarPic" alt="Avatar Picture"></td>
		<td><button @click="removeFriend">Remove Friend</button></td>
	</tr>
</template>
<script lang="ts">
import { deleteFriend } from './api/friendship.api'
export default {
  props: {
    friend: {
      type: Object,
      required: true
    }
  },
	data() {
		return {
			avatarPic: `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/userImage/` + this.friend.displayName,
		}
	},
	updated() {
		this.avatarPic = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/userImage/` + this.friend.displayName;
	},
  methods: {
		async removeFriend() {
			try {
					await deleteFriend(this.friend.displayName)
					this.$emit('friendRemoved', this.friend.id)
			} catch (error) {
				console.error('Failed to remove friend');
			}
    }
  }
}
</script>
<style scoped>
td {
	border: 1px solid black;
	border-collapse: collapse;
	padding: 10px;
}
</style>