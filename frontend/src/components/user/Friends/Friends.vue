<template>
    <div class="friends">
		<h1>Friends</h1>
		<ul v-if="friends.length">
			<li v-for="friend in friends" :key="friend">{{friend}}<button>Remove Friend</button></li>
		</ul>
		<div v-else>
			You dont have friends yet!
		</div>
		<Button text="Add Friend" color="LightGray" />
    </div>
</template>

<script>
import Button from '../../Button.vue'
export default {
	data() {
		return {
			friends: [1, 2],
		};
	},
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
