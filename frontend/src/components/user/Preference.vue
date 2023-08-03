<template>
  <div class="text-center">Welcome {{ getUserName }}</div>
  <div class="text-center">change user name</div>
  <Twofactor></Twofactor>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import Twofactor from './Twofactor.vue'

const authStore = useAuthStore()
//authStore.getuserProfile()
const { getUserName } = storeToRefs(authStore)
</script>
