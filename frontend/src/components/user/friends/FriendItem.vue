<template>
	<tr>
		<td class="displayName details">{{ friend.displayName }}</td>
		<td class="userName details">{{ friend.userName }}</td>
		<td class="status details">{{ friend.currentStatus }}</td>
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
