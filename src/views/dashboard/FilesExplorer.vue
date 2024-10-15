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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { FSObject } from 'guby';
import { computed, ref, watch } from 'vue';

const sessionId = useSessionId();
const { toast } = useToast();

const fetchFolderChildren = (url: string) =>
  api.ls.post({ url, sessionId: sessionId.value }).then(({ data }) => data ?? []);

const path = ref(['root']);
const url = computed(() => path.value.join('/'));

const { state, isLoading, execute } = useAsyncState(() => fetchFolderChildren(url.value), []);
const newNameStore = computed(() => state.value.map((object) => object.name));

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
        title: 'Помилка видалення',
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

async function moveFSObject(index: number, newName: string) {
  const object = state.value[index];

  const hasCopy = state.value.some(
    (stateFile, stateIndex) => stateFile.name === newName && stateIndex !== index
  );

  if (hasCopy) {
    toast({
      variant: 'destructive',
      title: 'Помилка перейменування',
      description: `Не вдалося перейменувати "${object.name}" на "${newName}". Обране ім'я вже зайняте.`,
      duration: 4_000,
    });

    return;
  }

  const fullPath = `${url.value}/${object.name}`;
  locked.value = locked.value.add(fullPath);

  try {
    const { data: success, error } = await api.mv.put({
      sessionId: sessionId.value,
      url: fullPath,
      destinationUrl: `${url.value}/${newName}`,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Помилка перейменування',
        description: `Не вдалося перейменувати "${object.name}" на "${newName}". ${error}`,
        duration: 4_000,
      });
    }

    if (success) execute();
  } finally {
    locked.value.delete(fullPath);
    locked.value = locked.value;
  }
}

function downloadFSObject(object: FSObject) {
  const filename = encodeURIComponent(
    object.type === 'folder' ? `${object.name}.zip` : object.name
  );
  const fullPath = encodeURIComponent(`${url.value}/${object.name}`);
  return window.open(`/download/${sessionId.value}/${filename}?url=${fullPath}`);
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
          <ContextMenuItem
            :disabled="locked.has(`${url}/${object.name}`)"
            @select="downloadFSObject(object)"
          >
            <Icon icon="tabler:download" />
            Завантажити
          </ContextMenuItem>
          <Dialog v-slot="{ close }">
            <ContextMenuItem
              :disabled="locked.has(`${url}/${object.name}`)"
              @select="$event.preventDefault()"
              as-child
            >
              <DialogTrigger>
                <Icon icon="tabler:edit" />
                Перейменувати
              </DialogTrigger>
            </ContextMenuItem>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Введіть нове ім'я</DialogTitle>
                <DialogDescription>Введіть нове ім'я для "{{ object.name }}".</DialogDescription>
              </DialogHeader>
              <Label :for="`newName/${url}/${object.name}`">Назва</Label>
              <Input
                :name="`newName/${url}/${object.name}`"
                :placeholder="object.name"
                minlength="1"
                maxlength="256"
                pattern="^[\p{L}\p{N}\s\-_\.]+(\.[\p{L}\p{N}]{2,})?$"
                v-model="newNameStore[index]"
              />
              <DialogFooter>
                <KeepAlive>
                  <Button
                    type="submit"
                    icon="tabler:edit"
                    :action="() => moveFSObject(index, newNameStore[index])"
                    @finally="close"
                  >
                    Перейменувати
                  </Button>
                </KeepAlive>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ContextMenuSeparator />
          <ContextMenuItem
            :disabled="locked.has(`${url}/${object.name}`)"
            @select="deleteFSObject(index)"
            class="text-destructive"
          >
            <Icon icon="tabler:trash" />
            Видалити
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </TableBody>
  </Table>
</template>
