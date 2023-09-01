<template>
  <div class="menu-item" @click="isOpen = !isOpen">
    <a href="#">
      {{ title }}
    </a>
    <svg viewBox="0 0 1030 638" width="10">
      <path
        d="M1017 68L541 626q-11 12-26 12t-26-12L13 68Q-3 49 6 24.5T39 0h952q24 0 33 24.5t-7 43.5z"
        fill="#FFF"
      ></path>
    </svg>
    <transition name="fade" appear>
      <div class="sub-menu" v-if="isOpen">
        <div class="menu-item">
          <router-link to="/user/Preference">Preference</router-link>
        </div>
        <div class="menu-item">
          <router-link to="/user/Profile">Profile</router-link>
        </div>
        <div class="menu-item">
          <router-link to="/user/Matchhistory">Match History</router-link>
        </div>
        <div class="menu-item">
          <router-link to="/user/Friends">Friends</router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {},
  name: 'usersDropDown',
  props: ['title'],
  data() {
    return {
      isOpen: false
    }
  }
})
</script>

<style>
@import '../../assets/menu.css';
</style>
