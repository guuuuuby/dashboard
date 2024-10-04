<script setup lang="ts">
import { api } from '@/lib/api';
import { useSessionId } from '@/lib/composables/useSessionId';
import { computed, onMounted, useTemplateRef } from 'vue';

const streamContainer = useTemplateRef('stream');

const sessionId = useSessionId();
const liveUrl = computed(() => `/live/${sessionId.value}`);

function handleClick(event: MouseEvent, aux: boolean) {
  const img = streamContainer.value;

  if (!img) return;

  console.log('click');

  api.click.post({
    aux,
    sessionId: sessionId.value,
    point: {
      x: event.offsetX / img.offsetWidth,
      y: event.offsetY / img.offsetHeight,
    },
  });
}

const handleBasicClick = (event: MouseEvent) => handleClick(event, false);
const handleAuxClick = (event: MouseEvent) => handleClick(event, true);

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
    class="m-auto max-h-full max-w-full border rounded-lg shadow-2xl object-fit select-none"
    draggable="false"
    @click.left.prevent="handleBasicClick"
    @click.right.prevent="handleAuxClick"
    @dblclick="$event.preventDefault()"
  />
</template>
