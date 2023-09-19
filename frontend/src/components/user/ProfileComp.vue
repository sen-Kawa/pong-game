<template>
    <div class="profile row">
        

        <div class="column">
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
        <div class="column">
            <h1>User Statistics</h1>
            <p>Number of games played: {{ numberOfGames }}</p>
            <p>Wins & losses: {{ wins }} win(s), {{ losses }} loss(es)</p>
            <p>Ladder level : {{ position }} of {{ numberOfPlayers  }} </p>
            
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useAuthStore } from '../../stores/auth.js'
    import Twofactor from './TwoFactor.vue'
    import FileUpload from './FileUpload.vue'
    const backendUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}`

    const authStore = useAuthStore()
    authStore.getuserProfile()
    const numberOfPlayers = ref<string>()
    const numberOfGames = ref<string>()
    const position = ref<string>()
    const wins = ref<string>()
    const losses = ref<string>()

    const requestOptions: RequestInit = {
        method: 'GET',
        credentials: 'include'
    }
    fetch(`${backendUrl}/statistics/`, requestOptions).then(response => { return response.json() }).then( responseData => { 
        // console.log(responseData)
        numberOfPlayers.value = responseData[0].numberOfPlayers
        numberOfGames.value = responseData[0].numberOfGames
        position.value = responseData[0].position
        wins.value = responseData[0].wins
        losses.value = responseData[0].losses
    })
</script>

<style>
    .column {
        float: left;
        width: 50%;
    }
</style>