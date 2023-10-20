<template>
  <div>
    <ChatBuilder />
    <Header />
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/HeaderComp.vue'
import Footer from './components/Footer.vue'
import ChatBuilder from '@/components/khrov-chat/ChatBuilder.vue'
import { socket } from '@/sockets/sockets'
import { useAuthStore } from './stores/auth'
import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`
const authStore = useAuthStore()

socket.on('disconnect', async () => {
  if (authStore.isLoggedIn) {
    const response = await axios.get(baseUrl + 'refresh', {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })
    if (response && response.status == 200) {
      socket.socket.connect()
    }
  }

})
</script>

<style>
@import './assets/main.css';
</style>
