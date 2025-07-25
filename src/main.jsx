import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-phone-number-input/style.css';
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './context/authContext/authContext.jsx';

createRoot(document.getElementById('root')).render(


  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
