import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const THEME_STORAGE_KEY = "mediahub.theme"
const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
const initialTheme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark"
document.documentElement.setAttribute("data-theme", initialTheme)
document.body.setAttribute("data-theme", initialTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
