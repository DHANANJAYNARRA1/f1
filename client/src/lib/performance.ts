/**
 * Performance optimization utilities for faster page loading
 */

// Log performance data for debugging
export function logPerformance(message: string) {
  console.log(message);
}

// Measure time since page load - improved version
export function measurePageLoadTime() {
  // Use Performance API for more accurate measurements
  if (window.performance && window.performance.now) {
    const loadTime = window.performance.now();
    logPerformance(`Page load time: ${Math.round(loadTime)}ms`);
    return loadTime;
  }
  return 0;
}

// Log performance metrics (called from main.tsx)
export function logPerformanceMetrics() {
  logPerformance('Performance metrics logging initialized');
  
  // Use requestIdleCallback to not block rendering
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      const loadTime = performance.now();
      logPerformance(`Page load time: ${Math.round(loadTime)}ms`);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loadTime = performance.now();
        logPerformance(`Page load time: ${Math.round(loadTime)}ms`);
      }, 0);
    });
  }
}

// For backward compatibility 
export const deferOperation = (callback: () => void, delayMs = 100) => {
  deferNonCriticalOperations(callback, delayMs);
};

// Preload resources
export const preloadResources = (resources: string[]) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 
              resource.endsWith('.css') ? 'style' : 
              resource.endsWith('.png') || resource.endsWith('.jpg') || resource.endsWith('.svg') ? 'image' : 
              'fetch';
    document.head.appendChild(link);
  });
};

// Lazy loading utility
export function deferNonCriticalOperations(callback: () => void, delayMs = 100) {
  logPerformance("Performance optimization: Non-critical operations deferred");
  
  // Use requestIdleCallback if available, otherwise use setTimeout
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => callback());
  } else {
    setTimeout(callback, delayMs);
  }
}

// Preload critical resources
export function preloadCriticalResources(resources: string[]) {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.js') ? 'script' : 
              resource.endsWith('.css') ? 'style' : 
              resource.endsWith('.png') || resource.endsWith('.jpg') || resource.endsWith('.svg') ? 'image' : 
              'fetch';
    document.head.appendChild(link);
  });
}

// Reduce layout thrashing by batching DOM operations
export function batchDOMOperations(operations: (() => void)[]) {
  // Request animation frame to batch operations during browser's optimal time
  window.requestAnimationFrame(() => {
    operations.forEach(operation => operation());
  });
}

// Dynamic image loading with blurred placeholder
export function createProgressiveImage(lowResSrc: string, highResSrc: string, imgElement: HTMLImageElement) {
  // Set low-res immediately
  imgElement.src = lowResSrc;
  imgElement.style.filter = 'blur(10px)';
  
  // Load high-res in background
  const highResImg = new Image();
  highResImg.src = highResSrc;
  highResImg.onload = () => {
    imgElement.src = highResSrc;
    imgElement.style.filter = 'blur(0)';
    imgElement.style.transition = 'filter 0.3s ease-in-out';
  };
}

// Cache fetched data in SessionStorage for faster re-access
export function cacheData(key: string, data: any, expiryMs = 60000) {
  try {
    const item = {
      data,
      expiry: Date.now() + expiryMs
    };
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

// Retrieve cached data if not expired
export function getCachedData(key: string) {
  try {
    const cachedItem = sessionStorage.getItem(`cache_${key}`);
    if (!cachedItem) return null;
    
    const item = JSON.parse(cachedItem);
    if (Date.now() > item.expiry) {
      sessionStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return null;
  }
}

// Priority-based script loading
export function loadScript(src: string, priority: 'high' | 'medium' | 'low' = 'medium') {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    // Set loading priority 
    if (priority === 'high') {
      // Load immediately
      document.head.appendChild(script);
    } else if (priority === 'medium') {
      // Slight delay
      setTimeout(() => document.head.appendChild(script), 100);
    } else {
      // Low priority - load when idle
      deferNonCriticalOperations(() => document.head.appendChild(script));
    }
    
    script.onload = resolve;
    script.onerror = reject;
  });
}