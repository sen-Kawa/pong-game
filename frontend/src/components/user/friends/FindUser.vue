<template>
  <div>
    <h2>Find User</h2>
    <form @submit.prevent="findUser">
      <label for="name">User's Name: </label>
      <input v-model="name" type="text" id="name" />
      <button type="submit">Find</button>
    </form>
    <div v-if="foundUser && foundUser.length > 0">
      <h3>User details</h3>
      <li v-for="userData in foundUser" :key="userData['userName']">
        <p>
          {{ userData['displayName'] }} {{ userData['userName'] }}
          <AddFriend :friendName="userData['displayName']" @friendAdded="onFriendAdded" />
        </p>
      </li>
    </div>
    <div v-if="message" :class="messageType">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import AddFriend from './AddFriend.vue'
import { postFindUser } from './api/friendship.api.js'

export default {
  data() {
    return {
      name: '',
      message: '',
      messageType: '',
	  foundUser: []
    }
  },
  components: {
    AddFriend
  },
  methods: {
    onFriendAdded() {
      this.$emit('onFriendAdded')
    },
    async findUser() {
      if (!this.name) {
        alert('Add name to search')
        return
      }
	  try {
	  	const response = await postFindUser(this.name)
      	this.foundUser = response.data
   	   if (!this.foundUser || this.foundUser.length === 0 || this.foundUser.length === undefined) {
    	    this.message = `${this.name} not found.`
    	 	 this.messageType = 'error'
     	} else {
       	 this.message = `Found ${this.name}`
       	 this.messageType = 'success'
      	}
	} catch(error) {
		console.error('Error making the request in FindUser', error);
		if (error.response.data.statusCode === 400) {
        	this.message = error.response.data.message[0]
		}
		else {
        	this.message = error.response.data.statusText
		}
    	this.messageType = 'error'
	  }
      this.name = ''
      setTimeout(() => {
        this.message = ''
      }, 5000)
      setTimeout(() => {
		this.foundUser = []
      }, 10000)
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
