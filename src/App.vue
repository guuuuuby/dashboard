<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/toast';

useColorMode();
</script>

<template>
  <Toaster />
  <RouterView />
</template>
