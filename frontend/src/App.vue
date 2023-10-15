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
import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/`

socket.on('failed_con', async () => {
  console.log('i was here')
  const response = await axios.get(baseUrl + 'refresh', {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  })
  if (response && response.status == 200) {
    socket.socket.connect()
  }
})
</script>

<style>
@import './assets/main.css';
</style>
