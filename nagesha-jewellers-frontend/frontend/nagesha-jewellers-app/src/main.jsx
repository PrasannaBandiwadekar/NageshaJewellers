import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import './styles/tokens.css'

// This is where React actually "starts". It finds the <div id="root">
// in index.html and renders our whole app inside it.
//
// AuthProvider and CartProvider wrap the entire app so that EVERY page
// can know "is someone logged in?" and "what's in their cart?" without
// us having to pass that information down manually through every component.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
