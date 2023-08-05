<template>
  <ButtonC
    @btn-click="addFriend()"
    :text="isAdded ? 'Added' : 'Add Friend'"
    :color="isAdded ? 'Green' : 'LightGray'"
  />
  <div v-if="message" :class="messageType">{{ message }}</div>
</template>

<script lang="ts">
import { postAddFriend } from './api/friendship.api'
import ButtonC from '../../Button.vue'

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
    ButtonC
  },
  emits: ['friendAdded'],
  methods: {
    async addFriend() {
      const responseData = await postAddFriend(this.friendName)

      if (responseData === undefined) {
        this.isAdded = true
        this.message = `Successfully added ${this.friendName} to your friend list!`
        this.messageType = 'success'
        this.$emit('friendAdded')
      } else {
        this.message =
          responseData.message || `Failed to add ${this.friendName} to your friend list.`
        this.messageType = 'error'
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
