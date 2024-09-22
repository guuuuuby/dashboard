<script setup lang="ts">
import { api } from '@/lib/api';
import type { Treaty } from '@elysiajs/eden';
import { onMounted } from 'vue';
import { useTemplateRef } from 'vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const video = useTemplateRef('stream');

const sessionId = computed(() =>
  Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
);

onMounted(() => {
  const ws = api.stream({ sessionId: sessionId.value }).index.subscribe();
  const mediaSource = new MediaSource();
  let buffer: SourceBuffer | null = null;
  
  async function onSocketMessage(event: Treaty.OnMessage<unknown>) {
    if (!buffer || buffer?.updating) return;
    buffer.appendBuffer(await (event.data as Blob).arrayBuffer());
  }
  
  mediaSource.onsourceopen = () => {
    if (!video.value) return;
    
    buffer = mediaSource.addSourceBuffer('video/webm; codecs=vp9');
    video.value.src = URL.createObjectURL(mediaSource);
    
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
