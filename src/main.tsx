import { createRoot } from 'react-dom/client'
import App from './App.tsx' // 👈 Ajoutez .tsx si nécessaire
import './index.css'

createRoot(document.getElementById('root')!).render(
  <App />
)