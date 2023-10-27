<template>
  <div class="component-title">{{ getUserName }} Preferences</div>
  <div class="column-container">
  <div class="column">
	  <div class="component-subtitle">Change Avatar</div>
 	 <FileUpload></FileUpload>
 </div>
  <div class="column">
	<div class="component-subtitle">Enable/Disable 2FA</div>
  	<Twofactor></Twofactor>
  </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import Twofactor from './TwoFactor.vue'
import FileUpload from './FileUpload.vue'
const authStore = useAuthStore()
//authStore.getuserProfile()

const { getUserName } = storeToRefs(authStore)


</script>

<style scoped>
.component-subtitle {
	margin-top: 30px;
}
</style>
