<template>
  <div class="text-center">Welcome {{ getUserName }}</div>
  <div class="text-center">change user name</div>

  <img v-bind:src="avatarUrl" width="50" height="60" />
  <Twofactor></Twofactor>
  <FileUpload></FileUpload>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import Twofactor from './TwoFactor.vue'
import FileUpload from './FileUpload.vue'
const authStore = useAuthStore()
const avatarUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/userImage`

const { getUserName } = storeToRefs(authStore)
</script>
