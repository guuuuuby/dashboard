<script setup lang="ts">
import '@xterm/xterm/css/xterm.css';
import { Terminal } from '@xterm/xterm';
import { useTemplateRef } from 'vue';
import { onMounted } from 'vue';
import { ref } from 'vue';

const terminalContainer = useTemplateRef('terminal');

onMounted(() => {
  const container = terminalContainer.value;
  if (!container) return;

  const terminal = new Terminal({windowOptions:{}});
  let command: string[] = [];
  terminal.open(container);
  terminal.write('> ');
  
  terminal.onData((data) => {
    if (data === '\u007F') {
      if (command.length > 0) {
        terminal.write('\b \b');
        command.pop();
      }
    } else if (data === '\r') {
      terminal.write('\n\r> ');
      command = [];
    } else {
      terminal.write(data);
      command.push(data);
    }
  });
});
</script>

<template>
  <h2 class="font-bold text-2xl">Термінал</h2>
  <div class="rounded-xl border overflow-hidden">
    <div ref="terminal" class="p-2 bg-black"></div>
  </div>
</template>
