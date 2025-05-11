import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Background from './Background';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Background className='bg'/>
  </StrictMode>,
)
