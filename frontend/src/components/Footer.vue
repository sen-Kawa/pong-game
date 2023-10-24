<template>
	<footer>
		<p>Copyleft &#127279; 2023</p>
		<router-link to="/about">About</router-link>
	</footer>
</template>

 <script lang="ts">
	export default {
		name: 'FooterApp',
	}
</script>

<style scoped>
@import '../assets/styles.css';
	a {
		color: white;
	}
	footer {
		font-family: space;
		padding-top: 1px;
		padding-bottom: 4px;
		text-align: center;
	  background-color: black;
	  color: white;
	  bottom: 0%;
	  width: 100%;
	  position: fixed;
	}
</style>
