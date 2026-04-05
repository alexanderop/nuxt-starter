<script setup lang="ts">
import type { NuxtError } from '#app'

import { clearError } from '#imports'

defineProps<{
  error: NuxtError
}>()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-6xl font-bold">
        {{ error.statusCode }}
      </h1>
      <p class="mt-4 text-lg">
        {{ error.statusMessage || 'Something went wrong' }}
      </p>
      <button class="mt-6 underline" @click="clearError({ redirect: '/' })">Go home</button>
    </div>
  </div>
</template>
