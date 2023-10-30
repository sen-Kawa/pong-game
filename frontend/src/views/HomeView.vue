<template>
  <div v-if="!isLoggedIn">
    <div>
      <img src="/oauth.svg" alt="OAuth image" />
    </div>
    <div>
      <a class="component-title login" v-bind:href="back_url"> Login with your 42 account </a>
    </div>
    <!-- <p>Fake login for testing</p>
    <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
      <div class="form-group">
        <label>User Id</label>
        <Field
          name="username"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.username }"
        />
        <div class="invalid-feedback">{{ errors.username }}</div>
      </div>
      <div class="form-group">
        <button class="btn btn-primary" :disabled="isSubmitting">
          <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
          Login
        </button>
      </div>
      <div v-if="errors.apiError">{{ errors.apiError }}</div>
    </Form> -->
  </div>
  <div v-else class="component-title">Welcome {{ getUserName }}</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
// import { Field, Form } from 'vee-validate'
// import * as Yup from 'yup'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
// const schema = Yup.object().shape({
//   username: Yup.string().required('Username is required')
// })

// async function onSubmit(values: any, { setErrors }: any) {
//   const { username } = values
//   const stuff = await authStore.login(username)
//   setErrors({ apiError: stuff })
// }

const back_url = `${import.meta.env.VITE_BACKEND_SERVER_URI}/auth/42login/`
const { isLoggedIn } = storeToRefs(authStore)
const { getUserName } = storeToRefs(authStore)
</script>

<style scoped>
.login {
  font-size: 20px;
}

img {
  width: 300px;
  padding-bottom: 30px;
  padding-top: 50px;
}
</style>
