<template>
  <div v-if="!activated2FA">
    <button type="button" class="change2fa" @click="change2fa">Activate 2fa</button>
  </div>
  <div v-if="activated2FA">
    <button type="button" class="change2fa" @click="change2fa">Deactivate 2fa</button>
  </div>
  <div v-if="url != ''">
    <br /><img :src="url" /> <br />
    <input type="text" v-model="code" />
    <button @click="verify2FA" class="codeSend">Send code</button>
  </div>
  <div v-if="error">{{ error }}</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import jwtInterceptor from '../../interceptor/jwtInterceptor'

const error = ref('')
const authStore = useAuthStore()

const { activated2FA } = storeToRefs(authStore)

const url = ref('')
const code = ref('')
const baseUrlauth = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`

const change2fa = () => {
  if (!activated2FA.value) {
    jwtInterceptor
      .get(baseUrlauth + 'activate2FA', {
        withCredentials: true
      })
      .then((response) => {
        url.value = response.data.url
      })
      .catch((err) => {
        url.value = ''
        if (err.response?.status == 401) {
          authStore.logout()
        } else error.value = 'Unknown error, contact an admin'
      })
  } else {
    url.value = ''
    authStore.deactivate2FA()
  }
}
const verify2FA = () => {
  if (code.value == '') return
  const body = { code: code.value }
  jwtInterceptor
    .post(baseUrlauth + 'verifyactivate2fa', body, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    .then((response) => {
      if (response.status == 200) {
        url.value = ''
        authStore.activate2FA()
        error.value = ''
      }
    })
    .catch((err) => {
      if (err.response?.status == 401) authStore.logout()
      else error.value = err.response?.data?.message
    })
}
</script>

<style scoped>
</style>
