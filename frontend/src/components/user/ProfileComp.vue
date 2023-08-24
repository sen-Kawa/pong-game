<script setup lang="ts">
import { ref } from 'vue'
let displayName = ref('Test User')
let userName = ref('test')
let isTfa = ref('false')
let email = ref('')
//let tfaMarker = ref('checked')
let listItems = []

async function getData() {
  const res: Response = await fetch(
    `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/user-profile/`,
    {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
      // headers: {
      //     "Content-Type": "application/json"
      // },
    }
  )
  // console.log(res.text())
  const finalRes = await res.json()
  listItems = finalRes
  // console.log(listItems)
  displayName.value = listItems.name
  // userName.value = listItems.login
  userName.value = listItems.userName
  isTfa.value = listItems.tfa
  email.value = listItems.email
  let tfaCheckbox: any = document.querySelector('#tfa')
  if (Boolean(isTfa.value) == true) {
    tfaCheckbox.checked = true
  } else {
    tfaCheckbox.checked = false
  }
}
getData()
</script>

<template>
  <div class="profile">
    <h1>User Profile</h1>
    <p>Full Name: {{ displayName }}</p>
    <p>Username : {{ userName }}</p>
    <p>Email : {{ email }}</p>
    <p>Avatar : (upload file)</p>
    <p>
      <label for="tfa">
        Enable Two-Factor Authentication
        <input type="checkbox" id="tfa" name="tfa" value="false" />
      </label>
    </p>
  </div>
</template>
