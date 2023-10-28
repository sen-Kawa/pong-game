<template>
  <div class="friends">
    <h1 class="component-title">Friends</h1>
    <table v-if="friends.length">
		<tr>
      <th class="component-subtitle">Name</th>
			<th class="component-subtitle">User Name</th>
			<th class="component-subtitle">Status</th>
			<th class="component-subtitle">Avatar</th>
			<th></th>
		</tr>
     		 <Friend
       		 v-for="friend in friends"
       		 :key="friend['id']"
       		 :friend="friend"
        	@friendRemoved="onFriendRemoved"
     		 />
    </table>
    <div class="details" v-else>You dont have friends yet!</div>
    <ButtonApp class="findUser"
      @btn-click="toggleShowFindUser()"
      :text="showFindUser ? 'Close' : 'Find User'"
      color="LightGray"
    />
    <FindUser v-show="showFindUser" @onFriendAdded="onFriendAdded" />
  </div>
</template>

<script lang="ts">
import ButtonApp from '../../ButtonApp.vue'
import Friend from './FriendItem.vue'
import FindUser from './FindUser.vue'
import { getFriendList } from './api/friendship.api.js'

export default {
  data() {
    return {
      showFindUser: false,
      friends: [] as { displayName: string; id: number; }[],
    }
  },
  components: {
    ButtonApp,
    Friend,
    FindUser
  },
  mounted() {
    this.fetchFriendList()
  },
  methods: {
    toggleShowFindUser() {
      this.showFindUser = !this.showFindUser
    },
    onFriendAdded() {
      this.fetchFriendList()
    },
    onFriendRemoved() {
      this.fetchFriendList()
    },
    async fetchFriendList() {
		try {
      		this.friends = await getFriendList()
		}
		catch(error) {
			console.error('Error fetching friends list');
		}                  
    }              		
  }
}
</script>

<style scoped>
div.friends {
	text-align: center;
}
table, th, td {
	margin: 0 auto;
	border: 1px solid black;
	border-collapse: collapse;
	padding: 10px;
}
.findUser {
	margin-top: 70px;
}
</style>
