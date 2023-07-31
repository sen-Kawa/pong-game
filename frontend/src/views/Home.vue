<template>
    <div v-if="!isLoggedIn">
        <div>
            <a v-bind:href=back_url>
                42 login
            </a>
        </div>
    </div>
</template>


<script setup lang="ts">
//TODO open 42 login in router-view
//TODO refresh token log in?
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia'
import router from '../router'


const authStore = useAuthStore();
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
// const schema = Yup.object().shape({
//     username: Yup.string().required('Username is required'),
//     password: Yup.string().required('Password is required')
// });

// async function onSubmit(values: any, { setErrors } : any) {
//     const { username, password } = values;
//     const stuff = await authStore.login(username, password);
//     setErrors({apiError: stuff})
// }

</script>
