import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { cartAPI } from '@/services/api'
import { useAuth } from './AuthContext'

interface Product {
  _id: string
  title: string
  images: string[]
  price: number
  discountPrice?: number
  brand: string
  stock: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  loading: boolean
  itemCount: number
  subtotal: number
  addToCart: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (productId: string) => boolean
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return }
    try {
      setLoading(true)
      const res = await cartAPI.get()
      setItems(res.data.data?.items || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  async function addToCart(productId: string, quantity = 1) {
    try {
      const res = await cartAPI.add(productId, quantity)
      setItems(res.data.data?.items || [])
    } catch (err) {
      throw err
    }
  }

  async function removeFromCart(productId: string) {
    const res = await cartAPI.remove(productId)
    setItems(res.data.data?.items || [])
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) { await removeFromCart(productId); return }
    const res = await cartAPI.update(productId, quantity)
    setItems(res.data.data?.items || [])
  }

  async function clearCart() {
    await cartAPI.clear()
    setItems([])
  }

  function isInCart(productId: string) {
    return items.some((item) => item.product._id === productId)
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price
    return sum + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider value={{
      items, loading, itemCount, subtotal,
      addToCart, removeFromCart, updateQuantity, clearCart, isInCart, refresh,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
