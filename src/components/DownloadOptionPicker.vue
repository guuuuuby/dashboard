<script setup lang="ts">
import { downloadOptions } from '@/lib/downloadOptions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Icon } from '@iconify/vue';

defineProps<{
  label?: string;
  wFull?: boolean;
}>();
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button class="gap-1" :class="{ 'w-full': wFull }" variant="secondary">
        <Icon icon="tabler:download" class="text-xl" />
        {{ label ?? 'Завантажити клієнт' }}
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
</template>
