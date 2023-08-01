<template>
	<div>
		<li v-for="user in users">
			{{ user.userName }}
		</li>
	</div>
</template>
	
<script setup lang="ts">

import { onMounted, ref } from 'vue';
import axios from 'axios';
const users = ref([])

onMounted(() => {
	getFriends();
})
const baseUrl = `${import.meta.env.VITE_BACKEND_SERVER_URI}/users/`;
async function getFriends() {
	try {
		const response = await axios.get(baseUrl + 'friends',
			{
				headers: {
					'Content-Type': 'application/json'
				},
				withCredentials: true
			});

		users.value = response.data[0].following;
		console.log(response.data[0].following);
		//const users = ref(response.data)

	}
	catch (error: any) {
		console.log(error);
	}
}

</script>