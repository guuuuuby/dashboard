<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const streamContainer = useTemplateRef('stream');

const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);
const liveUrl = computed(() => `/live/${sessionId.value}`);

onMounted(() => {
  if (!streamContainer.value) return;

  const ws = new WebSocket(liveUrl.value);
  ws.binaryType = 'arraybuffer';

  async function onSocketMessage(event: MessageEvent<ArrayBuffer>) {
    const blob = new Blob([event.data], { type: 'image/jpeg' });
    const image = new Image();
    const url = URL.createObjectURL(blob);
    image.src = url;
    image.onload = () => URL.revokeObjectURL(url);
  }

  ws.addEventListener('message', onSocketMessage);

  return () => {
    ws.removeEventListener('message', onSocketMessage);
    ws.close();
  };
});
</script>

<template>
  <img ref="stream" class="w-full h-full object-fit" />
</template>
