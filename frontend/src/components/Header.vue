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
nav {
  width: 100vw;
  background-color: #0d0d0e;
  display: flex;
  align-items: center;
  justify-content: center;
}
nav .menu-item {
  color: #FFF;
  padding: 25px 40px;
  position: relative;
  text-align: center;
  border-bottom: 5px solid transparent;
  display: flex;
  transition: 0.4s;
}
nav .menu-item.active,
nav .menu-item:hover {
  background-color: #0d0d0e;
  border-bottom-color: #bb3030;
}
nav .menu-item a {
  color: inherit;
  text-decoration: none;
}
</style>