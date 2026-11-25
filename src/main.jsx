import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Dashboard service worker registration failed:", {code: /^[0-9A-Z]{5}$/.test(error?.code || '') || ['ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENOTFOUND'].includes(error?.code) ? error.code : 'INTERNAL'});
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
