<script setup lang="ts">
import { ref, onMounted } from 'vue'

// REPLACE THE VALUE BELOW WITH YOUR COPIED URL
const backendUrl = 'https://8080-cs-4bbc53d6-4b0f-4d9e-af19-7990acdadf06.cs-us-east1-yeah.cloudshell.dev'

const message = ref<string>('Connecting to backend...')
const error = ref<string>('')

onMounted(async () => {
  try {
    console.log('Fetching from:', backendUrl)
    const response = await fetch(`${backendUrl}/api/test`, {
      headers: {
        'Accept': 'application/json'
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
        <p><small>Note: If you are seeing a CORS or 403 error, it is likely because Cloud Shell is private.</small></p>
    </div>
    <p v-else style="font-size: 1.5em; color: green;">
      Backend Response: <strong>{{ message }}</strong>
    </p>
  </div>
</template>
