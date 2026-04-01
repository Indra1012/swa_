import Lenis from 'lenis'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// --- Axios Global Retry Interceptor ---
// Silently retries requests up to 3 times on "Network Error"
// This perfectly catches the brief gap when nodemon restarts the backend
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    
    // Retry on Network Error OR server errors like 500/502/503/504
    const status = error.response ? error.response.status : null
    const shouldRetry = error.message.includes('Network Error') || (status && status >= 500)

    if (!config || !shouldRetry || config.__retryCount >= 5) {
      return Promise.reject(error)
    }
    
    config.__retryCount = (config.__retryCount || 0) + 1
    
    // Wait 2 seconds before retrying to give Node/MongoDB enough time to boot
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    return axios(config)
  }
)
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.8,
  touchMultiplier: 1.5,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
