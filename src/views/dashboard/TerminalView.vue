<script setup lang="ts">
import { api } from '@/lib/api';
import { useSessionId } from '@/lib/composables/useSessionId';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { onMounted, useTemplateRef, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const sessionId = useSessionId();
const terminalContainer = useTemplateRef('terminal');
const title = ref("Під'єднання до віддаленого термінала...");

const syncTerminalSize = useDebounceFn(
  (columns: number, lines: number) => {
    api.terminal.put({
      sessionId: sessionId.value,
      event: {
        action: 'sync',
        columns,
        lines,
      },
    });
  },
  100,
  { maxWait: 500 }
);

onMounted(() => {
  const ws = new WebSocket(`/live/${sessionId.value}?channel=terminal`);
  ws.binaryType = 'arraybuffer';

  const container = terminalContainer.value;
  if (!container) return;

  const fitAddon = new FitAddon();
  const terminal = new Terminal();
  terminal.open(container);
  terminal.loadAddon(fitAddon);
  fitAddon.fit();

  const resizeObserver = new ResizeObserver(() => fitAddon.fit());
  resizeObserver.observe(container, { box: 'content-box' });

  terminal.onTitleChange((newTitle) => {
    title.value = newTitle;
  });
  terminal.onResize(({ cols, rows }) => syncTerminalSize(cols, rows));

  terminal.writeln("Під'єднання до віддаленого термінала...");

  ws.addEventListener('open', () => {
    terminal.writeln('Очікування відповіді від клієнта...');
    title.value = 'Очікування відповіді від клієнта...';
    api.terminal.put({
      sessionId: sessionId.value,
      event: {
        action: 'open',
        columns: terminal.cols,
        lines: terminal.rows,
      },
    });

    terminal.onData((data) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      ws.send(data);
    });

    ws.addEventListener('message', (event) => {
      const data = new Uint8Array(event.data);
      terminal.write(data);
    });
  });

  return () => {
    ws.close();
    terminal.dispose();
    fitAddon.dispose();
    resizeObserver.disconnect();
    api.terminal.put({
      sessionId: sessionId.value,
      event: { action: 'close' },
    });
  };
});
</script>

<template>
  <section class="rounded-xl border overflow-hidden h-full shadow-2xl">
    <div class="border-b px-2 py-1 flex justify-center items-center">
      <div class="[&>*]:aspect-square [&>*]:h-4 [&>*]:rounded-full flex h-full gap-2">
        <div class="bg-zinc-200 dark:bg-zinc-800"></div>
        <div class="bg-zinc-200 dark:bg-zinc-800"></div>
        <div class="bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
      <h2 class="flex-1 text-center">{{ title }}</h2>
    </div>
    <div ref="terminal" class="p-2 w-full h-full bg-black"></div>
  </section>
</template>
