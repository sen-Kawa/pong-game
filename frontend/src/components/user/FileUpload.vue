<template>
  <div class="row">
    <img class="avatar" v-bind:src="avatarUrl" />
    <div class="col-8">
      <label class="btn btn-default p-0">
        <input class="file-upload-form" type="file" accept="image/*" ref="file" @change="selectImage"/>
      </label>
    </div>

    <div class="col-4">
      <button class="btn btn-success btn-sm float-right" @click="upload">Upload</button>
    </div>
    <div v-if="errormsg">{{ errormsg }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { AxiosError } from 'axios'
const file = ref()
const errormsg = ref('')
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/`
let avatarUrl = ref(`${import.meta.env.VITE_BACKEND_SERVER_URI}/users/userImage`)
function selectImage(event: Event) {
  const target = event.target as HTMLInputElement
  file.value = (target.files as FileList)[0]
}
async function upload() {
  let formData = new FormData()
  formData.append('file', file.value)
  try {
    await axios.post(baseUrl + 'upload', formData, {
      headers: {
        'Content-Type': 'image'
      },
      withCredentials: true
    })
    avatarUrl.value = avatarUrl.value + '?12222'
  } catch (error) {
    if (error instanceof AxiosError) {
      errormsg.value = error.response?.data?.message
    } else {
      return error
    }
  }
}
</script>
