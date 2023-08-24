<template>
  <div>
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from './components/HeaderComp.vue'
import Footer from './components/FooterComp.vue'
</script>

<style>
@import './assets/main.css';
</style>
