<template>
    <div class="text-center">
      Welcome {{authStore.getUserName}}
    </div>
</template>

<script setup lang="ts">

import User from '../../components/user/User.vue'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
//authStore.userProfile();

</script>
