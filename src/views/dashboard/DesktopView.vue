<script setup lang="ts">
import { api } from '@/lib/api';
import { useSessionId } from '@/lib/composables/useSessionId';
import { onMount } from '@/lib/utils';
import { useEventListener } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';

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

function handleKeyboardEvent(event: KeyboardEvent) {
  api.keypress.post({
    sessionId: sessionId.value,
    event: {
      action: event.type === 'keyup' ? 'up' : 'down',
      key: event.key,
      keyCode: event.code,
      modifiers: [
        event.metaKey && 'meta',
        event.ctrlKey && 'control',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
      ].filter(Boolean) as any,
    },
  });
}

const handleBasicClick = (event: MouseEvent) => handleClick(event, false);
const handleAuxClick = (event: MouseEvent) => handleClick(event, true);

useEventListener('keydown', handleKeyboardEvent);
useEventListener('keyup', handleKeyboardEvent);

onMount(() => {
  const ws = new WebSocket(liveUrl.value);
  ws.binaryType = 'arraybuffer';
  ws.addEventListener('message', onSocketMessage);

  async function onSocketMessage(event: MessageEvent<ArrayBuffer>) {
    if (!streamContainer.value) return;

    const blob = new Blob([event.data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    streamContainer.value.src = url;
    streamContainer.value.onload = () => URL.revokeObjectURL(url);
  }

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
