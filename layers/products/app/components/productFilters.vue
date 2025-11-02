<script setup lang="ts">
/**
 * ProductFilters component (Products Layer)
 *
 * Provides filtering UI for products using Nuxt UI components
 * Validates filter inputs with Zod to ensure data integrity
 */

import { ref, computed } from 'vue'
import { UCard, UButton, UInput, USelect, UCheckbox } from '#components'
import type { ProductCategory } from '../schemas/product'
import type { SelectItem } from '@nuxt/ui'
import { ProductFilterSchema, ProductSortSchema, type ProductFilter, type ProductSort } from '../schemas/filters'

interface Props {
  filter: ProductFilter
  sort: ProductSort
  categories: ProductCategory[]
}

type UpdateFilterEmit = (eventName: 'update:filter', filter: ProductFilter) => void
type UpdateSortEmit = (eventName: 'update:sort', sort: ProductSort) => void
type ResetEmit = (eventName: 'reset') => void
type Emits = UpdateFilterEmit & UpdateSortEmit & ResetEmit

const { filter, sort, categories } = defineProps<Props>()

const emit = defineEmits<Emits>()

const searchQuery = ref(filter.search || '')
const selectedCategory = ref<ProductCategory | 'all'>(filter.category || 'all')
const inStockOnly = ref(filter.inStock || false)
const selectedSort = ref(sort)

const categoryItems = computed<SelectItem[]>(() => [
  { label: 'All Categories', value: 'all' },
  ...categories.map(cat => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: cat,
  })),
])

const sortItems = computed<SelectItem[]>(() => [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Price (Low to High)', value: 'price-asc' },
  { label: 'Price (High to Low)', value: 'price-desc' },
  { label: 'Rating (High to Low)', value: 'rating-desc' },
])

function applyFilters() {
  // Validate filter data before emitting
  const filterData = {
    category: selectedCategory.value,
    inStock: inStockOnly.value,
    search: searchQuery.value || undefined,
  }

  const filterResult = ProductFilterSchema.safeParse(filterData)
  if (!filterResult.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid filter data:', filterResult.error.issues)
    return
  }

  const sortResult = ProductSortSchema.safeParse(selectedSort.value)
  if (!sortResult.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid sort value:', sortResult.error.issues)
    return
  }

  emit('update:filter', filterResult.data)
  emit('update:sort', sortResult.data)
}

function handleReset() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  inStockOnly.value = false
  selectedSort.value = 'name-asc'
  emit('reset')
}

// Apply filters when values change
function handleSearchInput() {
  applyFilters()
}

function handleCategoryChange() {
  applyFilters()
}

function handleStockChange() {
  applyFilters()
}

function handleSortChange() {
  applyFilters()
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Filters
        </h2>
        <UButton
          type="button"
          variant="outline"
          color="primary"
          size="sm"
          label="Reset"
          @click="handleReset"
        />
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <!-- Search -->
      <div class="flex flex-col gap-1.5">
        <label
          for="search"
          class="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Search
        </label>
        <UInput
          id="search"
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          icon="i-lucide-search"
          @input="handleSearchInput"
        />
      </div>

      <!-- Category -->
      <div class="flex flex-col gap-1.5">
        <label
          for="category"
          class="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Category
        </label>
        <USelect
          id="category"
          v-model="selectedCategory"
          :items="categoryItems"
          value-key="value"
          @change="handleCategoryChange"
        />
      </div>

      <!-- Sort -->
      <div class="flex flex-col gap-1.5">
        <label
          for="sort"
          class="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Sort By
        </label>
        <USelect
          id="sort"
          v-model="selectedSort"
          :items="sortItems"
          value-key="value"
          @change="handleSortChange"
        />
      </div>

      <!-- In Stock -->
      <div class="pt-2">
        <UCheckbox
          v-model="inStockOnly"
          label="In stock only"
          @change="handleStockChange"
        />
      </div>
    </div>
  </UCard>
</template>
