<template>
	<footer>
		<h3>Transcendence</h3>
		<p>Copyleft &#127279; 2023</p>
		<router-link to="/about">About</router-link>
	</footer>
</template>

<script>
	export default {
		name: 'FooterApp',
	}
</script>
<style scoped>
	a {
		color: white;
	}
	footer {
		padding-top: 1px;
		padding-bottom: 4px;
		text-align: center;
	  background-color: #252525;
	  color: white;
	  position: absolute;
	  bottom: 0%;
	  width: 100%;
	  line-height: 0.4;
	}
</style>
