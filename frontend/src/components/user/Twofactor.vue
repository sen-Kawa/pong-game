<template>
  <div v-if="!activated2FA" class="text-center">
    <button type="button" class="logoutButton" @click="change2fa">activate 2fa</button>
  </div>
  <div v-if="activated2FA" class="text-center">
    <button type="button" class="logoutButton" @click="change2fa">deactivate 2fa</button>
  </div>
  <div v-if="url != ''">
    <br /><img :src="url" /> <br />
    <input type="text" v-model="code" />
    <button @click="verify2FA">Send code</button>
  </div>
</template>

<script setup lang="ts">
//TODO find a way that the component rerenders after button click
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import axios from 'axios'

const authStore = useAuthStore()

const { activated2FA } = storeToRefs(authStore)

const url = ref('')
const code = ref('')
authStore.getuserProfile()

const change2fa = () => {
  if (!activated2FA.value) {
    axios
      .get('http://localhost:3000/auth/activate2FA', {
        withCredentials: true
      })
      .then((response) => {
        url.value = response.data.url
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    url.value = ''
    authStore.deactivate2FA()
  }
}
const verify2FA = () => {
  if (code.value == '') return
  const body = { code: code.value }
  console.log(body)
  axios
    .post('http://localhost:3000/auth/verifyactivate2fa', body, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    .then((response) => {
      console.log(response)
      if (response.status == 201) {
        url.value = ''
        authStore.activate2FA()
      }
    })
    .catch((err) => {
      console.log(err)
    })
}
</script>
