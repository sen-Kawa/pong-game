<template>
    <div class="text-center">
      Welcome {{getUserName}}
    </div>
        <div class="text-center">
      change user name
    </div>
    <Twofactor></Twofactor>
    <FriendShip></FriendShip>
    <FriendShipr></FriendShipr>
    <FriendShipl></FriendShipl>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import Twofactor from './Twofactor.vue'
import FriendShip from './FriendShip.vue'
import FriendShipr from './FriendShipr.vue'
import FriendShipl from './FriendShipl.vue'

const authStore = useAuthStore();
//authStore.getuserProfile()
const { 
  getUserName
} = storeToRefs(authStore) 


</script>

