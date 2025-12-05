<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Your Ngrok URL
const backendUrl = 'https://diedra-uncheering-synthia.ngrok-free.dev'

const message = ref<string>('Connecting to backend...')
const error = ref<string>('')

onMounted(async () => {
  try {
    console.log('Fetching from:', backendUrl)
    const response = await fetch(`${backendUrl}/api/test`, {
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Bypasses the Ngrok warning page
      }
    })

    if (!response.ok) {
       throw new Error(`Server returned ${response.status}`)
    }

    const data = await response.json()
    message.value = data.message
  } catch (err: any) {
    error.value = err.message
    message.value = 'Failed to load'
  }
})
</script>

<template>
  <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
    <h1>Photo-Sync App</h1>
    <div v-if="error" style="color: red; margin: 20px;">
        <p><strong>Error:</strong> {{ error }}</p>
        <p><small>Check console logs for details.</small></p>
    </div>
    <p v-else style="font-size: 1.5em; color: green;">
      Backend Response: <strong>{{ message }}</strong>
    </p>
  </div>
</template>
