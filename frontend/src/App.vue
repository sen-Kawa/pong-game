<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import { defineComponent} from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router';
const route = useRoute();

export default defineComponent({
  name: 'App',
  components: { Header, Footer}
})

</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: aqua;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
    width: 100vw;
}

body {
    background-color: #fff;
    display: flex;
    height: 100vh;
    width: 100vw;

    justify-content: center;
    align-content: center;
    margin: 0;
    overflow: hidden
}

#footer {
  height: 40px; 
    position: fixed; 
    bottom:0%;
    width:100%;
}

#header {
  position: sticky;
  height: 10vh;
  top: 0;
}
</style>