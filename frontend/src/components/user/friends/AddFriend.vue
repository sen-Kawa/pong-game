<template>
  <ButtonApp
    @btn-click="addFriend()"
    :text="isAdded ? 'Added' : 'Add Friend'"
    :color="isAdded ? 'Green' : 'LightGray'"
  />
  <div v-if="message" :class="messageType">{{ message }}</div>
</template>

<script lang="ts">
import { postAddFriend } from './api/friendship.api'
import ButtonApp from '../../ButtonApp.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

export default {
  props: {
    friendName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: '',
      messageType: '',
      isAdded: false
    }
  },
  components: {
    ButtonApp
  },
  emits: ['friendAdded'],
  methods: {
    async addFriend() {
	try {
      await postAddFriend(this.friendName)
      this.isAdded = true
      this.message = `Successfully added ${this.friendName} to your friend list!`
      this.messageType = 'success'
      this.$emit('friendAdded')
	} 
	catch(error) {
      this.message = `Failed to add ${this.friendName} to your friend list.`
      this.messageType = 'error'
		if (error.response.data.statusCode === 401) {
  			authStore.logout()
		}
	} 
      setTimeout(() => {
        this.message = ''
      }, 5000)
    }
  }
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
