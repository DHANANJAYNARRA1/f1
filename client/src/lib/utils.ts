import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useLayoutEffect } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This helper ensures useEffect runs the same in both preview and new tabs
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Force a browser reflow/repaint to ensure consistent rendering
export function forceReflow() {
  if (typeof window !== 'undefined') {
    // Reading a property that requires layout calculation forces a reflow
    const _ = document.body.offsetHeight;
  }
}

// Convert URL for consistent behavior in preview and new tabs
export function ensureAbsoluteUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  
  // Already absolute URL
  if (path.startsWith('http')) return path;
  
  // Ensure leading slash
  const normPath = path.startsWith('/') ? path : `/${path}`;
  
  // Use current origin
  return `${window.location.origin}${normPath}`;
}
