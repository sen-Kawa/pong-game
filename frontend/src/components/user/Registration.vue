<template>
    <div v-if="!isLoggedIn">
        <h2>Registration of a new Account</h2>
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
            <div class="form-group">
                <label>Username</label>
                <Field name="username" type="text" class="form-control" :class="{ 'is-invalid': errors.username }" />
                <div class="invalid-feedback">{{ errors.username }}</div>
            </div>
            <div class="form-group">
                <label>Password</label>
                <Field name="password" type="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
            <div class="form-group">
                <label>Repeat Password</label>
                <Field name="password2" type="password" class="form-control" :class="{ 'is-invalid': errors.password }" />
                <div class="invalid-feedback">{{ errors.password2 }}</div>
            </div>
            <div class="form-group">
                <button class="btn btn-primary" :disabled="isSubmitting">
                    <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
                    Login
                </button>
            </div>
            <div v-if="errors.apiError">{{ errors.apiError }}</div>
        </Form>
    </div>
</template>

<script setup lang="ts">
//TODO open 42 login in router-view
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { useAuthStore } from '../../stores/auth';
import { storeToRefs } from 'pinia'
import router from '../../router'


const authStore = useAuthStore();
import axios from 'axios';
const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/registration/`
const { isLoggedIn } = storeToRefs(authStore)
//TODO more checks if username/password is ok
const schema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    password2: Yup.string()
        .oneOf([Yup.ref("password"), ''], "Passwords arn't the same")
        .required('Repeated Password is required')

});

async function onSubmit(values: any, { setErrors }: any) {
    try {
        const response = await axios.post(
            back_url,
            values,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        )
        router.push('/user/Preference');
    }

    catch (error: any) {
        setErrors({ apiError: error.response.data.message });
    }
    ;
}

</script>