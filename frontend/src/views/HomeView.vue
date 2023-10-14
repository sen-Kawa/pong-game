<template>
  <div v-if="!isLoggedIn">
    <div>
      <img src="../../public/oauth.svg" alt="OAuth image" />
    </div>
    <div>
      <a v-bind:href="back_url"> 42 login </a>
      <TestLogin></TestLogin>
      <a class="component-title login" v-bind:href="back_url"> Login with your 42 account </a>
    </div>
  </div>
  <div v-else class="component-title">Welcome {{ getUserName }}</div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import TestLogin from '@/components/user/TestLogin.vue'

const authStore = useAuthStore()
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
const { getUserName } = storeToRefs(authStore)
</script>

<style scoped>
.login {
  font-size: 20px;
}

img {
  width: 300px;
  padding-bottom: 30px;
  padding-top: 50px;
}
</style>
