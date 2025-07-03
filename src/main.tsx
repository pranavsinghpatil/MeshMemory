import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/theme.css' // Import theme styles

createRoot(document.getElementById("root")!).render(<App />);
