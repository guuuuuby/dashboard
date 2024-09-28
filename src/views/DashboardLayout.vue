<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { toast } = useToast();

const links = [
  { link: '', label: 'Робочий стіл', icon: 'device-desktop' },
  { link: 'files', label: 'Файли', icon: 'file' },
];

const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);

function onDisconnect() {
  toast({
    variant: 'destructive',
    title: 'Відключення',
    description: 'Клієнт відключився від сервера',
    duration: 5_000,
  });

  router.push({ path: '/' });
}

onMounted(() => {
  const ws = api.join({ sessionId: sessionId.value }).subscribe();

  ws.subscribe(({ data }) => {
    if ('event' in data && data.event === 'disconnect') onDisconnect();
  });

  ws.addEventListener('close', onDisconnect);

  return () => {
    ws.removeEventListener('close', onDisconnect);
    ws.close();
  };
});
</script>

<template>
  <div class="flex gap-10 h-[100dvh] max-w-full overflow-hidden">
    <aside class="py-10 px-7 border-r w-fit">
      <h2 class="text-2xl font-bold text-center mb-4">Навігація</h2>
      <ul>
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
      </ul>
    </aside>
    <main class="max-h-full w-full overflow-y-auto m-10">
      <RouterView />
    </main>
  </div>
</template>
