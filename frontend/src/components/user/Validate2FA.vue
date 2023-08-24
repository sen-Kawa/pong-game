<template>
  <div class="text-center">
    <div>Validate yourself with your Auth App code</div>
    <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
      <div class="form-group">
        <label>Code:</label>
        <Field
          name="codeValue"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.codeValue }"
        />
        <div class="invalid-feedback">{{ errors.codeValue }}</div>
      </div>
      <div class="form-group">
        <button class="btn btn-primary" :disabled="isSubmitting">
          <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
          Submit
        </button>
      </div>
      <div v-if="errors.apiError">{{ errors.apiError }}</div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import * as Yup from 'yup'
import { useAuthStore } from '@/stores/auth'
const AuthStore = useAuthStore()

const schema = Yup.object().shape({
  codeValue: Yup.string().required('Code is required')
})

async function onSubmit(values: any, { setErrors }: any) {
  const { codeValue } = values
  const stuff = await AuthStore.validate2fa(codeValue)
  setErrors({ apiError: stuff })
}
</script>
