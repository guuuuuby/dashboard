import HomeView from '@/views/HomeView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:id',
      name: 'dashboard',
      component: () => import('@/views/DashboardLayout.vue'),
      children: [
        {
          path: '',
          name: 'desktop',
          component: () => import('@/views/dashboard/DesktopView.vue'),
        },
        {
          path: 'files',
          name: 'files',
          component: () => import('@/views/dashboard/FilesExplorer.vue'),
        },
        {
          path: 'terminal',
          name: 'terminal',
          component: () => import('@/views/dashboard/TerminalView.vue'),
        }
      ],
    },
  ],
});

export default router;
