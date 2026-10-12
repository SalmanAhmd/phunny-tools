import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PrefsProvider } from '@/store/prefs'
import { NonsenseProvider } from '@/store/nonsense'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/phunny-tools">
      <PrefsProvider>
        <NonsenseProvider>
          <App />
        </NonsenseProvider>
      </PrefsProvider>
    </BrowserRouter>
  </StrictMode>,
)
