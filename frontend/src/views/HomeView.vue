<template>
  <div v-if="!isLoggedIn">
    <div>
      <a v-bind:href="back_url"> 42 login </a>
      <TestLogin></TestLogin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import TestLogin from '@/components/user/TestLogin.vue'

const authStore = useAuthStore()
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
</script>
