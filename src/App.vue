<script setup lang="ts">
import { Toaster } from '@/components/ui/toast';
import { Icon } from '@iconify/vue';
import { useColorMode } from '@vueuse/core';
import { RouterView } from 'vue-router';
import { Button } from './components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';

const mode = useColorMode();
</script>

<template>
  <Toaster />
  <RouterView />
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="fixed bottom-2 left-2 text-xl rounded-full">
        <Icon
          icon="tabler:moon"
          class="transition-all dark:rotate-0 dark:scale-100 -rotate-90 scale-0"
        />
        <Icon
          icon="tabler:sun"
          class="absolute dark:rotate-90 dark:scale-0 transition-all rotate-0 scale-100"
        />
        <span class="sr-only">Змінити тему</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem class="gap-1" @click="mode = 'light'">
        <Icon class="text-lg" icon="tabler:sun" /> Світла
      </DropdownMenuItem>
      <DropdownMenuItem class="gap-1" @click="mode = 'dark'">
        <Icon class="text-lg" icon="tabler:moon" /> Темна
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="gap-1" @click="mode = 'auto'">
        <Icon class="text-lg" icon="tabler:device-desktop" /> Автоматично
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
