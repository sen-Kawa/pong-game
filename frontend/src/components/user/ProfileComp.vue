<template>
    <div class="profile row">
        <div class="column-container">
            <div class="column">
                <h1 class="component-title">User Profile</h1>
                <h2 class="component-subtitle">Full name: </h2>
                <p class="details">{{ authStore.getName }}</p>
                <h2 class="component-subtitle">42 Username: </h2>
                <p class="details">{{ authStore.getUserName }}</p>
                <h2 class="component-subtitle">Player name: </h2>
                <p class="details">{{ authStore.getDisplayName }}</p>
                <!-- <p>
               <input type="text" placeholder="new display name" v-model="nameInput" />
               <button @click="handleDisplayNameChange">Change display name</button>
           </p> -->
                <h2 class="component-subtitle">Email: </h2>
                <p class="details">{{ authStore.getEmail }}</p>
                <!-- <p>Avatar     : <img id="avatar" src="http://localhost:3000/users/userImage" width="50" height="60"><br></p> -->
                <h2 class="component-subtitle">Avatar</h2>
                <img class="avatar" v-bind:src="avatar2">
                <h2 class="component-subtitle">Two Factor Authentication</h2>
                <p class="details">{{ authStore.activated2FA }} </p>
            </div>
            <div class="column">
                <h1 class="component-title">User Statistics</h1>
                <h2 class="component-subtitle">Number of games played: </h2>
                <p class="details">{{ numberOfGames }}</p>
                <h2 class="component-subtitle">Wins and losses: </h2>
                <p class="details">{{ wins }} win(s), {{ losses }} loss(es)</p>
                <h2 class="component-subtitle">Ladder level: </h2>
                <p class="details">{{ position }} of {{ numberOfPlayers }} </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth.js'
// import Twofactor from './TwoFactor.vue'
// import FileUpload from './FileUpload.vue'
import jwtInterceptor from '../../interceptor/jwtInterceptor'

const backendUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}`

const authStore = useAuthStore()
authStore.getuserProfile()
const numberOfPlayers: any = ref<string>()
const numberOfGames: any = ref<string>()
const position: any = ref<string>()
const wins: any = ref<string>()
const losses: any = ref<string>()
const avatar2: any = ref<string>()

// const requestOptions: RequestInit = {
//     method: 'GET',
//     credentials: 'include'
// }

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
    } else {
        window.alert("Can't get statistics");
    }
}

async function getAvatar() {
    const response = await jwtInterceptor.get(backendUrl + '/users/userImage', {
        withCredentials: true, responseType: 'blob', timeout: 30000,
    }).catch(() => {
    })

    if (response && response.status == 200) {
        avatar2.value = URL.createObjectURL(response.data)
    } else {
        window.alert("Can't get avatar");
    }
}
getStatistics()
// fetch(backendUrl + '/users/userImage', { method: "GET", credentials: "include" }).then(response => {
//     console.log(response)
//     return response.blob()
// }).then((blob => {
//     console.log(blob)
//     avatar2.value =  URL.createObjectURL(blob)
// }))
getAvatar()
</script>

<style scoped></style>
