<template>
    <div class="friends">
		<h1>Friends</h1>
		<Button text="Show Friends List" color="LightGray" />
		<Button text="Add Friend" color="LightGray" />
		<Button text="Delete Friend" color="LightGray" />
    </div>
</template>

<script>
import Button from '../Button.vue'
export default {
	name: 'FriendsTab',
	components: {
		Button
	},
}
</script>

<style scoped>
	div.friends {
		#display: flex;
		#justify-content: space-between;
		#align-items: center;
	}
</style>
