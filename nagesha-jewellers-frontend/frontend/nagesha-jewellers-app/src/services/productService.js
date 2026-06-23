import api from './api'

// Each function here matches one endpoint on the .NET backend.
// Pages import these functions instead of writing axios calls directly -
// keeps things tidy and means we only write each API call once.

export const getProducts = (params = {}) => api.get('/products', { params })

export const getProductBySlug = (slug) => api.get(`/products/${slug}`)

export const getCategories = () => api.get('/categories')

// ---------- Admin-only category management ----------

export const getAllCategoriesAdmin = () => api.get('/categories/admin')

export const createCategory = (data) => api.post('/categories', data)

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)

export const deleteCategory = (id) => api.delete(`/categories/${id}`)

export const getFeaturedProducts = () => api.get('/products', { params: { featured: true } })

// ---------- Admin-only (require an Admin-role token, sent automatically) ----------

export const createProduct = (data) => api.post('/products', data)

export const updateProduct = (id, data) => api.put(`/products/${id}`, data)

export const deleteProduct = (id) => api.delete(`/products/${id}`)
