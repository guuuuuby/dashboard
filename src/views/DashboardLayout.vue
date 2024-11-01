<script setup lang="ts">
import DownloadOptionPicker from '@/components/DownloadOptionPicker.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { useSessionId } from '@/lib/composables/useSessionId';
import { onMount } from '@/lib/utils';
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const links = [
  { link: 'desktop', label: 'Робочий стіл', icon: 'device-desktop-filled' },
  { link: 'files', label: 'Файли', icon: 'file-filled' },
  { link: 'terminal', label: 'Термінал', icon: 'terminal' },
];

const sessionId = useSessionId();

function onDisconnect() {
  toast({
    variant: 'destructive',
    title: 'Відключення',
    description: 'Клієнт відключився від сервера',
    duration: 5_000,
  });

  router.push({ path: '/' });
}

function createSessionWS(sessionId: string, afterDisconnect: (isFromClient: boolean) => void) {
  const ws = api.join({ sessionId: sessionId }).subscribe();

  ws.subscribe(({ data }) => {
    console.info(data);

    if ('event' in data && data.event === 'disconnect') {
      console.log('disconnect event');
      ws.removeEventListener('close', onClose);
      ws.close();
      afterDisconnect(true);
    }
  });

  function onClose(event: unknown) {
    console.log('close', event);
    afterDisconnect(false);
  }

  ws.addEventListener('close', onClose);

  return {
    ws,
    cleanup() {
      ws.removeEventListener('close', onClose);
      ws.close();
    },
  };
}

onMount(() => {
  function afterDisconnect(isFromClient: boolean) {
    state.value.cleanup();

    if (isFromClient) {
      onDisconnect();
    } else {
      state.value = factory();
    }
  }

  const factory = () => createSessionWS(sessionId.value, afterDisconnect);
  const state = ref(factory());

  return () => state.value.cleanup();
});
</script>

<template>
  <div class="flex gap-10 h-[100dvh] max-w-full overflow-hidden">
    <aside class="py-10 px-7 border-r w-fit h-full">
      <h2 class="text-2xl font-bold text-center mb-4">Навігація</h2>
      <ul class="flex flex-col max-h-full">
        <li v-for="{ link, label, icon } in links">
          <Button
            as-child
            size="sm"
            :variant="`/${sessionId}/${link}` === route.path ? 'default' : 'ghost'"
          >
            <RouterLink :to="`/${sessionId}/${link}`" class="w-full">
              <span class="inline-flex gap-2 items-center justify-start w-full">
                <Icon :icon="`tabler:${icon}`" class="text-xl inline" />
                {{ label }}
              </span>
            </RouterLink>
          </Button>
        </li>
        <div class="flex-1"></div>
        <Separator class="my-2" />
        <li class="w-full">
          <DownloadOptionPicker label="Клієнт" w-full />
        </li>
      </ul>
    </aside>
    <main class="max-h-full w-full overflow-y-auto m-10">
      <RouterView />
    </main>
  </div>
</template>
