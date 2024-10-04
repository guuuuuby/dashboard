<script setup lang="ts">
import DownloadOptionPicker from '@/components/DownloadOptionPicker.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const id = ref('');
const router = useRouter();
</script>

<template>
  <main class="max-w-xs min-h-[100dvh] mx-auto flex flex-col gap-6 justify-center items-center">
    <form class="flex gap-2" @submit.prevent="router.push(`/${id}`)">
      <Input required placeholder="ID" class="font-mono" v-model="id" />
      <Button>Перейти</Button>
    </form>
    <Separator label="або" />
    <DownloadOptionPicker />
  </main>
</template>
