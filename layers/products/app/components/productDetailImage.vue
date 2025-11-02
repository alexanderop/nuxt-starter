<script setup lang="ts">
/**
 * Product Detail Image Gallery Component
 *
 * E-commerce best practices 2025:
 * - Carousel with thumbnails for multiple views
 * - Click to zoom in lightbox modal
 * - Swipe gestures on mobile
 * - Optimized image loading (webp, lazy, responsive)
 * - Loading states with skeleton
 */

import { ref, computed } from 'vue'
import { NuxtImg, UCarousel, UModal, UButton } from '#components'
import type { Product } from '#layers/products/app/schemas/product'

interface Props {
  product: Product
  class?: string
}

const { product, class: _className = '' } = defineProps<Props>()

// Multiple product images (currently just using same image, can be extended)
const images = computed(() => [
  product.image,
  product.image, // In real app: different angles
  product.image, // In real app: detail shots
])

const activeIndex = ref(0)
const isZoomOpen = ref(false)
const isLoading = ref(true)

function handleLoad() {
  isLoading.value = false
}

function selectImage(index: number) {
  activeIndex.value = index
}

function openZoom() {
  isZoomOpen.value = true
}
</script>

<template>
  <div :class="['relative w-full', className]">
    <!-- Loading skeleton -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl z-10"
    />

    <!-- Main image carousel -->
    <div class="relative group">
      <UCarousel
        :items="images"
        arrows
        :prev="{ color: 'neutral', variant: 'soft', size: 'sm' }"
        :next="{ color: 'neutral', variant: 'soft', size: 'sm' }"
        class="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10"
        @select="selectImage"
      >
        <template #default="{ item }">
          <div
            class="aspect-square sm:aspect-[4/3] max-w-full max-h-[600px] cursor-zoom-in"
            @click="openZoom"
          >
            <NuxtImg
              :src="item"
              :alt="product.name"
              sizes="sm:640px md:768px lg:1024px"
              :width="1024"
              :height="1024"
              format="webp"
              quality="85"
              loading="eager"
              class="w-full h-full max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              @load="handleLoad"
            />
          </div>
        </template>
      </UCarousel>

      <!-- Zoom hint badge -->
      <div class="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
        Click to zoom
      </div>
    </div>

    <!-- Thumbnails -->
    <div
      v-if="images.length > 1"
      class="flex gap-2 mt-4"
    >
      <button
        v-for="(image, index) in images"
        :key="index"
        type="button"
        class="relative w-16 h-16 rounded-lg overflow-hidden ring-2 transition-all"
        :class="activeIndex === index ? 'ring-primary-500' : 'ring-gray-200 dark:ring-gray-700 opacity-60 hover:opacity-100'"
        @click="selectImage(index)"
      >
        <NuxtImg
          :src="image"
          :alt="`${product.name} view ${index + 1}`"
          width="64"
          height="64"
          format="webp"
          quality="75"
          class="w-full h-full object-cover"
        />
      </button>
    </div>

    <!-- Zoom modal/lightbox -->
    <UModal
      v-model:open="isZoomOpen"
      fullscreen
      :overlay="true"
      :transition="true"
    >
      <template #content>
        <div class="relative h-full bg-black/95 flex items-center justify-center p-4">
          <!-- Close button -->
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="lg"
            class="absolute top-4 right-4 z-10"
            @click="isZoomOpen = false"
          />

          <!-- Zoomed image -->
          <NuxtImg
            :src="images[activeIndex]"
            :alt="product.name"
            sizes="100vw"
            :width="2048"
            :height="2048"
            format="webp"
            quality="90"
            class="max-w-full max-h-full object-contain"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
