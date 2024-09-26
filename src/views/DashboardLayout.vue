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

const links = [{ link: '', label: 'Робочий стіл', icon: 'device-desktop' }];

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
    if (data.event === 'disconnect') onDisconnect();
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
    <aside class="p-10 border-r">
      <h2>Навігація</h2>
      <Button v-for="{ link, label, icon } in links" as-child variant="ghost" size="sm">
        <RouterLink :to="`${sessionId}/${link}`">
          <Icon :icon="`tabler:${icon}`" class="text-xl mr-1" />
          {{ label }}
        </RouterLink>
      </Button>
    </aside>
    <main class="max-h-full overflow-y-auto p-10">
      <RouterView />
    </main>
  </div>
</template>
