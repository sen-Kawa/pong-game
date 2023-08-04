<template>
  <div class="text-center">Successfull logged in</div>
</template>

<script setup lang="ts">
window.opener.postMessage('test', 'http://localhost:8080')
window.close()
</script>
