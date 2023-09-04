<template>
  <div>
    <ChatBuilder />
    <Header />
      <router-view />
    <Footer />
  </div>
</template>

<script setup lang="ts">
  import { provide } from 'vue'
  import Header from './components/HeaderComp.vue'
  import Footer from './components/FooterComp.vue'
  import ChatBuilder from '@/components/khrov-chat/ChatBuilder.vue';

  provide('$HOST', 'http://localhost:3000');
</script>

<style>
@import './assets/main.css';
</style>
