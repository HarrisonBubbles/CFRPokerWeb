import { createRoot } from 'react-dom/client'
import './index.css'
import PocketPoker from './PocketPoker';
import Background from './Background';

createRoot(document.getElementById('root')!).render(
  <>
    <Background />
    <PocketPoker/>
  </>,
)
