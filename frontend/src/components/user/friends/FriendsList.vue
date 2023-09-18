<template>
  <div class="friends">
    <h1>Friends</h1>
    <ul v-if="friends.length">
      <Friend
        v-for="friend in friends"
        :key="friend['id']"
        :friend="friend"
        @friendRemoved="onFriendRemoved"
      />
    </ul>
    <div v-else>You dont have friends yet!</div>
    <ButtonApp
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
      friends: []
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
  align-items: center;
}
</style>
