import api from './api'

// Get all reviews + summary stats for a product
export const getProductReviews = (productId) =>
  api.get(`/reviews/${productId}`)

// Check if the logged-in user already reviewed this product
export const getMyReview = (productId) =>
  api.get(`/reviews/${productId}/my-review`)

// Submit a new review
export const createReview = (productId, data) =>
  api.post(`/reviews/${productId}`, data)

// Delete a review (own review, or admin deleting any)
export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`)
