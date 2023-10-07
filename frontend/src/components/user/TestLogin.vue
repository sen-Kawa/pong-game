<template>
  <p>Fake login for testing</p>
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
  </Form>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'

const schema = Yup.object().shape({
  username: Yup.string().required('Username is required')
})
const authStore = useAuthStore()
async function onSubmit(values: any, { setErrors }: any) {
  const { username } = values
  const stuff = await authStore.login(username)
  setErrors({ apiError: stuff })
}
</script>

<style scoped></style>
