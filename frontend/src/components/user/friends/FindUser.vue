<template>
  <div class="find-user">
    <h2 class="component-title">Find User</h2>
    <form @submit.prevent="findUser">
      <label class="component-subtitle" for="name">User's Name: </label>
      <input v-model="name" type="text" id="name" />
      <button class="search" type="submit">Search</button>
    </form>
    <div v-if="foundUser && foundUser.length > 0">
      <h3 class="component-title user-details">User details</h3>
    <table>
		<tr>
			<th class="component-subtitle">Name</th>
			<th class="component-subtitle">User Name</th>
			<th></th>
		</tr>
      <tr v-for="userData in foundUser" :key="userData['userName']">
		  <td class="details">{{ userData['displayName'] }}</td>
		  <td class="details">{{ userData['userName'] }}</td>
		  <td><AddFriend :friendName="userData['displayName']" @friendAdded="onFriendAdded" /></td>
      </tr>
    </table>
    </div>
    <div class="message" v-if="message" :class="messageType">{{ message }}</div>
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
	  foundUser: [] as { displayName: string; userName: string; }[],
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
	} catch(error: any) {
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
.search {
	margin-left: 10px;
}
.find-user {
	border: 1px solid black;
	max-width: 600px;
	margin: 0 auto;
	padding-bottom: 20px;
	margin-top: 60px;
	padding-top: 20px;
	box-shadow: 10px 10px;
	transition: transform .2s;
}
.find-user:hover {
	transform: scale(1.1);
}
input {
	height: 35px;
}
table, th, td {
	margin: 0 auto;
	border: 1px solid black;
	border-collapse: collapse;
	padding: 10px;
	box-shadow: 2px 2px;
}
.message {
	margin-top: 10px;
}
	.user-details {
		padding-top: 40px;
	}
</style>
