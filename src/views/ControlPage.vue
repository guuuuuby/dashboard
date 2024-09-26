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
    if (!streamContainer.value) return;

    const blob = new Blob([event.data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    streamContainer.value.src = url;
    streamContainer.value.onload = () => URL.revokeObjectURL(url);
  }

  ws.addEventListener('message', onSocketMessage);

  return () => {
    ws.removeEventListener('message', onSocketMessage);
    ws.close();
  };
});
</script>

<template>
  <div class="max-h-full max-w-full">
    <img ref="stream" class="w-3/4 mx-auto border rounded-lg shadow-2xl" />
  </div>
</template>
