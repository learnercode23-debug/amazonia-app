import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '@/constants/config'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  sendOtp: (phone: string) =>
    api.post('/api/auth/otp/send', { phone }),

  verifyOtp: (phone: string, otp: string, name?: string) =>
    api.post('/api/auth/otp/verify', { phone, otp, name }),

  getMe: () => api.get('/api/auth/me'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/api/auth/profile', data),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sort?: string
    order?: string
    featured?: boolean
    dealOfDay?: boolean
    minPrice?: number
    maxPrice?: number
  }) => api.get('/api/products', { params }),

  getById: (id: string) => api.get(`/api/products/${id}`),

  search: (q: string) => api.get('/api/products/search', { params: { q } }),

  getReviews: (id: string) => api.get(`/api/reviews/${id}`),

  postReview: (productId: string, data: { rating: number; title: string; comment: string }) =>
    api.post('/api/reviews', { productId, ...data }),

  getFrequentlyBought: (id: string) =>
    api.get(`/api/products/${id}/frequently-bought`),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: () => api.get('/api/categories?tree=true'),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (productId: string, quantity = 1) =>
    api.post('/api/cart', { productId, quantity }),
  update: (productId: string, quantity: number) =>
    api.put('/api/cart', { productId, quantity }),
  remove: (productId: string) =>
    api.delete('/api/cart', { data: { productId } }),
  clear: () => api.delete('/api/cart', { data: {} }),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list: () => api.get('/api/orders'),
  getById: (id: string) => api.get(`/api/orders/${id}`),
  placeCOD: (shippingAddress: Record<string, string>, couponCode?: string) =>
    api.post('/api/payment/cod', { shippingAddress, couponCode }),
  cancel: (id: string) => api.post(`/api/orders/${id}/cancel`),
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/api/wishlist'),
  toggle: (productId: string) => api.post('/api/wishlist', { productId }),
}

// ── Coupons ───────────────────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (code: string, subtotal: number) =>
    api.post('/api/coupons/validate', { code, subtotal }),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get('/api/notifications'),
  markAllRead: () => api.put('/api/notifications', { markAllRead: true }),
}

export default api
