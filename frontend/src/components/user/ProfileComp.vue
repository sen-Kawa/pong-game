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
    import axios from 'axios'
    import jwtInterceptor from '../../interceptor/jwtInterceptor'

    const backendUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}`

    const authStore = useAuthStore()
    authStore.getuserProfile()
    const numberOfPlayers: any = ref<string>()
    const numberOfGames: any = ref<string>()
    const position: any = ref<string>()
    const wins: any = ref<string>()
    const losses: any = ref<string>()

    const requestOptions: RequestInit = {
        method: 'GET',
        credentials: 'include'
    }

    async function getStatistics() {
        const response = await jwtInterceptor.get(backendUrl + '/statistics', {
            withCredentials: true
        })
        if (response && response.status == 200) {
            numberOfPlayers.value = response.data[0].numberOfPlayers
            numberOfGames.value = response.data[0].numberOfGames
            position.value = response.data[0].position
            wins.value = response.data[0].wins
            losses.value = response.data[0].losses
            // console.log(response.data) //.data
        } else {
            window.alert("Can't get statistics");
        }
    }

    getStatistics()
</script>

<style>
    .column {
        float: left;
        width: 50%;
    }
</style>