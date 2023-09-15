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
            <p>Number of games played: 5</p>
            <p>Wins & losses: 1 wins, 4 losses</p>
            <p>Ladder level : 2 of 25 </p>
            <!-- <p>Number of games played: {{ statistics.numberOfGames }}</p>
            <p>Wins & losses: {{ wins }} wins, {{ losses }} losses</p>
            <p>Ladder level : {{ position }} of {{ numberOfPlayers }} </p> -->
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useAuthStore } from '../../stores/auth.js'
    import Twofactor from './TwoFactor.vue'
    import FileUpload from './FileUpload.vue'

    let statistics: any

    const authStore = useAuthStore()
    authStore.getuserProfile()
    async function getStatistics(): Promise<any> {
        const response = await fetch("http://localhost:3000/statistics");
        const stats = await response.json();
        console.log(stats);
        return stats
    }
    // statistics = await getStatistics()
    // console.log("stats>>> ",statistics)
    // const nameInput =ref("")

    // async function handleDisplayNameChange() {
    //     console.log("Change name to: ", nameInput.value)
    //     await authStore.setDisplayName2(nameInput.value, '/user/Profile')
    //     nameInput.value = ''  // clear text field
    // }  
</script>

<style>
    .column {
        float: left;
        width: 50%;
    }
</style>