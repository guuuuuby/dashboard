import type { App } from 'guby';
import { treaty } from '@elysiajs/eden';

export const api = treaty<App>(new URL('/api', location.href).href);
