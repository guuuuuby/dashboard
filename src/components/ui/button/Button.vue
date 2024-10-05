<script setup lang="ts">
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/vue';
import { Primitive, type PrimitiveProps } from 'radix-vue';
import { computed, ref, type HTMLAttributes } from 'vue';
import { buttonVariants, type ButtonVariants } from '.';
import { PanelTopDashed } from 'lucide-vue-next';

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
  icon?: string;
  action?: () => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
});

const emit = defineEmits<{
  success: [];
}>();

const loading = ref(false);

async function callAction() {
  if (!props.action) return;

  loading.value = true;

  try {
    await props.action();
    emit('success');
  } finally {
    loading.value = false;
  }
}

const icon = computed(() => {
  if (loading.value) {
    return 'eos-icons:three-dots-loading';
  } else if (props.icon) {
    return props.icon;
  } else {
    return null;
  }
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), props.class)"
    :disabled="loading"
    @click="callAction"
  >
    <Icon v-if="icon" :icon />
    <slot />
  </Primitive>
</template>
