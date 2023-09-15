<template>
    <div class="profile">
        <h1>User Profile</h1>
        <p>Full name  : {{ authStore.getName }}</p>
        <p>42 User name  : {{ authStore.getUserName }}</p>
        <p>
            Player name: {{ authStore.getDisplayName }}
        </p>
        <!-- <p>
            <input type="text" placeholder="new display name" v-model="nameInput" />
            <button @click="handleDisplayNameChange">Change display name</button>
        </p> -->
        <p>Email      : {{ authStore.getEmail }}</p>
        <p>Avatar     : <img src="http://localhost:3000/users/userImage" width="50" height="60"><br>
            <FileUpload></FileUpload>
        </p>
        <p>Two-Factor Authentication enabled: {{ authStore.activated2FA }} </p>
        <Twofactor></Twofactor>
    </div>
</template>

<script setup lang="ts">
    // import { ref } from 'vue'
    import { useAuthStore } from '../../stores/auth.js'
    import Twofactor from './TwoFactor.vue'
    import FileUpload from './FileUpload.vue'


    const authStore = useAuthStore()
    authStore.getuserProfile()
    // const nameInput =ref("")

    // async function handleDisplayNameChange() {
    //     console.log("Change name to: ", nameInput.value)
    //     await authStore.setDisplayName2(nameInput.value, '/user/Profile')
    //     nameInput.value = ''  // clear text field
    // }  
</script>