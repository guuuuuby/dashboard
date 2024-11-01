import { onMounted, onUnmounted } from 'vue';

export function onMount(
  callback: () => undefined | null | VoidFunction
) {
  let onDispose: VoidFunction | null = null;

  onMounted(() => {
    onDispose = callback() ?? null;
  });

  onUnmounted(() => onDispose?.());
}
