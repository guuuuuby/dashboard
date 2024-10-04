import { computed } from 'vue';
import { useRoute } from 'vue-router';

export function useSessionId() {
  const route = useRoute();
  return computed(() => (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id));
}
