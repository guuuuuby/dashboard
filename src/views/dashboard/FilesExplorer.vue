<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { displayFileType, displaySize } from '@/lib/utils';
import { Icon } from '@iconify/vue';
import { useAsyncState } from '@vueuse/core';
import type { FSObject } from 'guby';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);

const fetchFolderChildren = async (url: string) => {
  await new Promise((r) => setTimeout(r, 1_000));
  // api.ls.get({ url, sessionId: sessionId.value }).then(({ data }) => data ?? []);
  return [
    { type: 'folder', name: 'Folder' },
    { type: 'file', name: 'guby.js', bytes: 1.4 * 2 ** 20 },
  ] satisfies FSObject[];
};

const path = ref(['root']);
const url = computed(() => path.value.join('/'));

const { state, isLoading, execute } = useAsyncState(() => fetchFolderChildren(url.value), []);

watch(url, () => execute());
</script>
<template class="max-h-full">
  <h2 class="text-2xl font-bold">Файли</h2>
  <Breadcrumb class="overflow-x-auto sticky top-0 bg-background shadow-2xl py-2 z-10">
    <BreadcrumbList class="flex-nowrap">
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <template v-for="(folder, index) in path">
        <BreadcrumbItem>
          <Button
            size="xs"
            :disabled="index + 1 >= path.length"
            :variant="index + 1 >= path.length ? 'secondary' : 'ghost'"
            @click="path.splice(index + 1)"
          >
            <Icon
              v-if="index + 1 >= path.length && isLoading"
              icon="eos-icons:three-dots-loading"
              class="text-2xl"
            />
            {{ folder }}
          </Button>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
      </template>
    </BreadcrumbList>
  </Breadcrumb>
  <Table>
    <TableCaption v-if="state.length === 0">
      <template v-if="isLoading">
        <Icon icon="eos-icons:three-dots-loading" class="text-4xl inline" />
        Завантаження даних
      </template>
      <template v-else> Ця тека порожня </template>
    </TableCaption>
    <TableHeader class="sticky top-0">
      <TableRow>
        <TableHead>Назва</TableHead>
        <TableHead>Розмір</TableHead>
        <TableHead>Тип</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="object in state" :key="`${url}/${object.name}`" class="w-fit rounded-lg">
        <template v-if="object.type === 'file'">
          <TableCell class="w-fit">
            <Icon icon="tabler:file" class="inline font-bold text-xl" />
            {{ object.name }}
          </TableCell>
          <TableCell>{{ displaySize(object.bytes) }}</TableCell>
          <TableCell>{{ displayFileType(object.name) }}</TableCell>
        </template>
        <template v-else-if="object.type === 'folder'">
          <TableCell class="min-w-fit">
            <Icon icon="tabler:folder" class="inline font-bold text-xl" />
            <Button variant="link" size="xs" @click="path.push(object.name)">
              {{ object.name }}
            </Button>
          </TableCell>
          <TableCell>--</TableCell>
          <TableCell>Тека</TableCell>
        </template>
      </TableRow>
    </TableBody>
  </Table>
</template>
