import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserContextProvider from './context/UserContext.jsx'
import { Toaster } from 'react-hot-toast'
import GetProducts from './context/GetProducts.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserContextProvider>
        <GetProducts>
          <Toaster position="top-center" />
            <App />
        </GetProducts>
      </UserContextProvider>
    </BrowserRouter>
  </StrictMode>,
)
