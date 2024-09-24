<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const video = useTemplateRef('stream');

const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);
const liveUrl = computed(() => `/live/${sessionId.value}`);

function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint16Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

onMounted(() => {
  const ws = new WebSocket(liveUrl.value);
  ws.binaryType = 'arraybuffer';
  const mediaSource = new MediaSource();
  let buffer: SourceBuffer | null = null;

  if (!video.value) return;

  video.value.src = URL.createObjectURL(mediaSource);

  ws.onopen = () => console.log('socket open');

  async function onSocketMessage(event: MessageEvent<ArrayBuffer>) {
    if (!buffer || buffer?.updating) return;

    console.log(event.data);
    
    buffer.appendBuffer(event.data);
  }

  mediaSource.onsourceopen = () => {
    buffer = mediaSource.addSourceBuffer('video/webm');

    ws.addEventListener('message', onSocketMessage);
  };

  return () => {
    ws.removeEventListener('message', onSocketMessage as any);
    ws.close();
    mediaSource.endOfStream();
  };
});
</script>

<template>
  <video ref="stream" autoplay playsinline class="w-full h-full object-fit" />
</template>
