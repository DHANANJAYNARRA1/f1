import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { preloadResources, deferOperation, logPerformanceMetrics } from "./lib/performance";

// Preload critical resources
preloadResources([
  '/images/logo.svg',
  '/fonts/main.woff2',
]);

// Create the root and render the application
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);

// Render the main application
root.render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
);

// Log performance metrics in development mode
logPerformanceMetrics();

// Defer non-critical operations
deferOperation(() => {
  // Prefetch fonts, images, or other resources that may be needed later
  const imageUrls = [
    '/products/hydroponics.jpg',
    '/products/ecg.jpg',
    '/products/hps.jpg',
    '/products/terrace.jpg'
  ];
  
  // Load images in the background
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
  
  // Ensure no service worker is registered that might cause issues
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service worker unregistered');
      }
    });
  }
  
  // Fix WebSocket connections in new tabs by ensuring properly formed URLs
  window.addEventListener('DOMContentLoaded', () => {
    // This fixes WebSocket URL parsing in new tabs
    try {
      const wsUrlFix = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return { protocol, host };
      };
      // Store the fixed URL parts in window for global access
      (window as any).__fixedWsUrl = wsUrlFix();
      console.log('WebSocket URL parts fixed:', (window as any).__fixedWsUrl);
    } catch (error) {
      console.error('Failed to fix WebSocket URL:', error);
    }
  });
});
