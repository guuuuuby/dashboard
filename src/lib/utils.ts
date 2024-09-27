import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function displaySize(bytes: number): string {
  const prefixes = ['', 'К', 'М', 'Г', 'Т', 'П'];
  let index = 0;
  while (bytes >= 1024) {
    index++;
    bytes /= 1024;
  }

  return bytes.toFixed(2) + ' ' + prefixes[index] + 'Б';
}
