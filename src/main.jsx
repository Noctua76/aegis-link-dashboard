import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}service-worker.js`

    navigator.serviceWorker
      .register(swUrl, { scope: import.meta.env.BASE_URL })
      .then(() => console.log('Aegis PWA ready'))
      .catch((err) => console.error('SW error', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)