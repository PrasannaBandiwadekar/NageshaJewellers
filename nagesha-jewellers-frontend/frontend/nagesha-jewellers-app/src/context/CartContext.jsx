import { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import * as cartService from '../services/cartOrderService'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Pull the latest cart from the backend. Called after login, and after
  // any add/update/remove, so what's on screen always matches the database.
  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const response = await cartService.getCart()
      setItems(response.data)
    } catch (err) {
      console.error('Could not load cart', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const addItem = async (productId, quantity = 1) => {
    await cartService.addToCart(productId, quantity)
    await refreshCart()
  }

  const updateQuantity = async (cartItemId, quantity) => {
    await cartService.updateCartItem(cartItemId, quantity)
    await refreshCart()
  }

  const removeItem = async (cartItemId) => {
    await cartService.removeCartItem(cartItemId)
    await refreshCart()
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0)

  return (
    <CartContext.Provider
      value={{ items, loading, itemCount, subtotal, refreshCart, addItem, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
