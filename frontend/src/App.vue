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

</script>

<style>
@import './assets/main.css';
</style>
