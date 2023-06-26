<template>
    <nav id="header">
        <div class="menu-item"><router-link to="/">Home</router-link></div>
        <div class="menu-item"><router-link to="/game">Game</router-link></div>
        <div class="menu-item"><router-link to="/leader">Leaderboard</router-link></div>
        <User title="User" /> 
    </nav>
</template>

<script setup lang="ts">
import User from '../components/user/User.vue'


</script>
<style>
@import "../assets/header.css"
</style>