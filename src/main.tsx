import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './shared/components/index.css'

import { LanguageProvider } from '@/shared/context/LanguageContext'
import { TrainingProvider } from '@/features/planner/contexts/TrainingContext'
import { MessageProvider } from '@/shared/context/MessageContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <MessageProvider>
          <TrainingProvider>
            <App />
          </TrainingProvider>
        </MessageProvider>
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>
)
