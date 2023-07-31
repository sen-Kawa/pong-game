<template>
    <div v-if="authStore.isLoggedIn">
    <nav id="header">
        <div class="menu-item"><router-link to="/">Home</router-link></div>
        <div class="menu-item"><router-link to="/game">Game</router-link></div>
        <div class="menu-item"><router-link to="/leader">Leaderboard</router-link></div>
        <User title="User" />
        <a @click="authStore.logout()" class="menu-item"><router-link to="/">Logout</router-link></a>
    </nav>
    </div>
    <div v-if="!authStore.isLoggedIn">
    <nav id="header">
        <div class="menu-item"><router-link to="/">Home</router-link></div>
        
    </nav>
    </div>
</template>

<script setup lang="ts">
import User from '../components/user/User.vue'
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

</script>

<style>
@import "../assets/header.css"
</style>