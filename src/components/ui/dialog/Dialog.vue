<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'radix-vue'
import { ref } from 'vue';

const props = defineProps<DialogRootProps>()
const emits = defineEmits<DialogRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

const open = ref(forwarded.value.defaultOpen);
</script>

<template>
  <DialogRoot v-bind="forwarded" v-model:open="open">
    <slot :close="() => open = false" />
  </DialogRoot>
</template>
