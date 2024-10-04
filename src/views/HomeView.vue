<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { downloadOptions } from '@/lib/downloadOptions';

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
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="gap-1" variant="secondary">
          <Icon icon="tabler:download" class="text-xl" />
          Завантажити клієнт
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Опції завантаження</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem v-for="{ icon, label, link } in downloadOptions" class="gap-1" as-child>
          <a :href="link" target="_blank">
            <Icon :icon class="text-xl" />
            {{ label }}
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </main>
</template>
