<template>
  <div v-if="!isLoggedIn">
	  <div>
		  <img src="../../public/oauth.svg" alt="OAuth image">
	  </div>
    <div>
      <a class="component-title" v-bind:href="back_url"> Login with your 42 account </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
</script>

<style scoped>
.component-title {
	font-size: 20px;
}

img {
	width: 300px;
	padding-bottom: 30px;
	padding-top: 50px;
}
</style>
