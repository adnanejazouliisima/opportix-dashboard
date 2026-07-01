import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './style.css';

// PWA : capter l'invite d'installation le plus tôt possible (l'événement ne se déclenche
// qu'une fois, parfois avant le montage de React). Stocké pour le composant InstallPrompt.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__deferredInstallPrompt = e;
  window.dispatchEvent(new Event('pwa-installable'));
});

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA : enregistrer le service worker uniquement en production (pas en dev Vite,
// pour éviter tout cache pendant le développement).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
