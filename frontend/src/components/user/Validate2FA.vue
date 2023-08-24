<template>
  <div class="text-center">
    <div>
      <form @submit.prevent="sendCode">
        <div class="mb-3 mt-3">
          <input
            v-model="code"
            type="string"
            class="form-control"
            placeholder="Enter code"
            name="twoFaCode"
            autocomplete="off"
          />
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const AuthStore = useAuthStore()
const code = ref('')
import { ref } from 'vue'
const sendCode = () => {
  AuthStore.validate2fa(code.value)
}
</script>
