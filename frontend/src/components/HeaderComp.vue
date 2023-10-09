<template>
	<div>

  <nav id="header" v-if="authStore.isLoggedIn">
    <div class="menu-item"><router-link to="/">Home</router-link></div>
    <div class="menu-item"><router-link to="/game">Game</router-link></div>
    <div class="menu-item"><router-link to="/leader">Leaderboard</router-link></div>
    <User title="User" />
    <div class="menu-item">
      <router-link @click="authStore.logout()" to="/">Logout</router-link>
    </div>
  </nav>
  <nav id="header" v-else>
    <div class="menu-item"><router-link to="/">Home</router-link></div>
  </nav>
		<h1 class="title">TRANSCENDENCE</h1>
	</div>
</template>

<script setup lang="ts">
import User from '../components/user/UserDropDown.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style>
@import '../assets/header.css';
@import '../assets/styles.css';
</style>
