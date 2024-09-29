<script setup lang="ts">
import { api } from '@/lib/api';
import { computed, onMounted, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const streamContainer = useTemplateRef('stream');

const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);
const liveUrl = computed(() => `/live/${sessionId.value}`);

function handleClick(event: MouseEvent) {
  const img = streamContainer.value;

  if (!img) return;

  api.click.post({
    sessionId: sessionId.value,
    point: {
      x: event.offsetX / img.offsetWidth,
      y: event.offsetY / img.offsetHeight,
    },
  });
}

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
  <img
    ref="stream"
    class="m-auto border rounded-lg shadow-2xl object-fit select-none"
    draggable="false"
    @click.prevent="handleClick"
    @auxclick="$event.preventDefault()"
    @dblclick="$event.preventDefault()"
  />
</template>
