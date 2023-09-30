<template>
  <div class="component-title">{{ getUserName }} Preferences</div>
  <img class="avatar" v-bind:src="avatarUrl" />
  <div class="component-subtitle">Change Avatar</div>
  <FileUpload></FileUpload>
  <div class="component-subtitle">Enable/Disable 2FA</div>
  <Twofactor></Twofactor>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import Twofactor from './TwoFactor.vue'
import FileUpload from './FileUpload.vue'
const authStore = useAuthStore()
authStore.getuserProfile()
const avatarUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/userImage`

const { getUserName } = storeToRefs(authStore)


</script>

<style scoped>
.component-subtitle {
	margin-top: 30px;
}
</style>
