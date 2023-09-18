<template>
  <div>
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
</script>

<style>
@import './assets/main.css';
</style>
