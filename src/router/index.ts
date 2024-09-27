import HomeView from '@/views/HomeView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      ],
    },
  ],
});

export default router;
