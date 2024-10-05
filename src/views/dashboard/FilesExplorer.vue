<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useSessionId } from '@/lib/composables/useSessionId';
import { displayFileType, displaySize } from '@/lib/utils';
import { Icon } from '@iconify/vue';
import { useAsyncState } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

const sessionId = useSessionId();
const { toast } = useToast();

const fetchFolderChildren = (url: string) =>
  api.ls.post({ url, sessionId: sessionId.value }).then(({ data }) => data ?? []);

const path = ref(['root']);
const url = computed(() => path.value.join('/'));

const { state, isLoading, execute } = useAsyncState(() => fetchFolderChildren(url.value), []);

watch(url, () => execute());

const locked = ref(new Set<string>());

async function deleteFSObject(index: number) {
  const object = state.value[index];
  const fullPath = `${url.value}/${object.name}`;
  locked.value = locked.value.add(fullPath);

  try {
    const { data: success, error } = await api.rm.delete({
      sessionId: sessionId.value,
      url: fullPath,
    });

    if (error) {
      const kind = object.type === 'file' ? 'файл' : 'теку';

      toast({
        variant: 'destructive',
        title: 'Помилка',
        description: `Не вдалось видалити ${kind} "${object.name}". ${error.value}.`,
        duration: 4_000,
      });
    }

    if (success) await execute();
  } finally {
    locked.value.delete(fullPath);
    locked.value = locked.value;
  }
}
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
      <ContextMenu v-for="(object, index) in state" :key="`${url}/${object.name}`">
        <ContextMenuTrigger as-child>
          <Transition
            enter-from-class="opacity-0"
            enter-active-class="transition-opacity duration-1000"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-active-class="transition-opacity duration-1000"
            leave-to-class="opacity-0"
          >
            <TableRow
              class="w-fit rounded-lg"
              :class="{ 'pointer-events-none': locked.has(`${url}/${object.name}`) }"
            >
              <template v-if="object.type === 'file'">
                <TableCell class="w-fit">
                  <Icon
                    class="inline font-bold text-xl"
                    :icon="
                      locked.has(`${url}/${object.name}`)
                        ? 'eos-icons:three-dots-loading'
                        : 'tabler:file'
                    "
                  />
                  {{ object.name }}
                </TableCell>
                <TableCell>{{ displaySize(object.bytes) }}</TableCell>
                <TableCell>{{ displayFileType(object.name) }}</TableCell>
              </template>
              <template v-else-if="object.type === 'folder'">
                <TableCell class="min-w-fit">
                  <Icon
                    class="inline font-bold text-xl"
                    :icon="
                      locked.has(`${url}/${object.name}`)
                        ? 'eos-icons:three-dots-loading'
                        : 'tabler:folder'
                    "
                  />
                  <Button variant="link" size="xs" @click="path.push(object.name)">
                    {{ object.name }}
                  </Button>
                </TableCell>
                <TableCell>--</TableCell>
                <TableCell>Тека</TableCell>
              </template>
            </TableRow>
          </Transition>
        </ContextMenuTrigger>
        <ContextMenuContent class="[&>*]:gap-1 bg-background/70 backdrop-blur-sm">
          <ContextMenuItem>
            <Icon icon="tabler:download" />
            Завантажити
          </ContextMenuItem>
          <ContextMenuItem>
            <Icon icon="tabler:edit" />
            Перейменувати
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @select="deleteFSObject(index)" class="text-destructive">
            <Icon icon="tabler:trash" />
            Видалити
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </TableBody>
  </Table>
</template>
