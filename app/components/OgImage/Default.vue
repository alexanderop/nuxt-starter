<script setup lang="ts">
const { title, description } = defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div
    style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #f8fafc;
      font-family: Inter, Arial, sans-serif;
    "
  >
    <div
      style="
        display: inline-flex;
        width: fit-content;
        align-items: center;
        gap: 18px;
        border: 1px solid rgba(248, 250, 252, 0.2);
        border-radius: 999px;
        padding: 12px 20px;
        font-size: 24px;
      "
    >
      <span
        style="
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.15);
          font-weight: 700;
        "
      >
        N
      </span>
      <span>Nuxt Starter</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 20px">
      <h1 style="margin: 0; font-size: 74px; line-height: 1; letter-spacing: -0.05em">
        {{ title || 'Nuxt Starter' }}
      </h1>
      <p
        style="
          max-width: 900px;
          margin: 0;
          font-size: 32px;
          line-height: 1.35;
          color: rgba(248, 250, 252, 0.82);
        "
      >
        {{ description || 'A minimal Nuxt baseline with strong patterns and sensible defaults.' }}
      </p>
    </div>
  </div>
</template>
