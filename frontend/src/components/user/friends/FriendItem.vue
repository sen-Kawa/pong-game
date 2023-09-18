<template>
  <div class="friend-item">
    <span class="friend-name">{{ friend.displayName }}</span>
    <button>Status</button>
    <button @click="removeFriend">Remove Friend</button>
  </div>
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
.friend-item {
  display: flex;
}
.friend-name {
  font-weight: bold;
  margin-right: 10px;
  font-size: 20px;
}
div.friends {
  align-items: center;
}
</style>
