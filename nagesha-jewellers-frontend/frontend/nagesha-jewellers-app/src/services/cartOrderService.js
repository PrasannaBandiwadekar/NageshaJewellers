import api from './api'

// ---------- Cart ----------
export const getCart = () => api.get('/cart')
export const addToCart = (productId, quantity = 1) => api.post('/cart', { productId, quantity })
export const updateCartItem = (cartItemId, quantity) => api.put(`/cart/${cartItemId}`, { quantity })
export const removeCartItem = (cartItemId) => api.delete(`/cart/${cartItemId}`)

// ---------- Checkout & Orders ----------
export const checkout = (shippingDetails) => api.post('/orders/checkout', shippingDetails)
export const verifyPayment = (data) => api.post('/orders/verify-payment', data)
export const getMyOrders = () => api.get('/orders')

// ---------- Admin: all orders ----------
export const getAllOrdersAdmin = () => api.get('/admin/orders')
export const updateOrderStatus = (orderId, status) =>
  api.put(`/admin/orders/${orderId}/status`, null, { params: { status } })
