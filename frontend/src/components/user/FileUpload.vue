<template>
  <div class="row">
    <div class="col-8">
      <label class="btn btn-default p-0">
        <input class="file-upload-form" type="file" accept="image/*" ref="file" @change="selectImage"/>
      </label>
    </div>

    <div class="col-4">
      <button class="btn btn-success btn-sm float-right" @click="upload">Upload</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { AxiosError } from 'axios'
const file = ref()
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/`

function selectImage(event: Event) {
  const target = event.target as HTMLInputElement
  file.value = (target.files as FileList)[0]
}
async function upload() {
  console.log(file.value)
  let formData = new FormData()
  formData.append('file', file.value)
  console.log(formData)
  try {
    await axios.post(baseUrl + 'upload', formData, {
      headers: {
        'Content-Type': 'image/png'
      },
      withCredentials: true
    })
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data?.message
    } else {
      return error
    }
  }
}
</script>
