import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './common/styles/css/index.css'
import App from './pages/App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
