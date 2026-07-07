import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  getProductReviews,
  getMyReview,
  createReview,
  deleteReview
} from '../services/reviewService'
import StarRating from './StarRating.jsx'
import '../styles/reviews.css'

export default function ProductReviews({ productId }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [summary, setSummary] = useState(null)
  const [myReview, setMyReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Review form state
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState('')
  const [formBody, setFormBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load reviews + check if logged-in user has already reviewed
  const loadReviews = async () => {
    setLoading(true)
    try {
      const summaryRes = await getProductReviews(productId)
      setSummary(summaryRes.data)

      if (user) {
        const myRes = await getMyReview(productId)
        setMyReview(myRes.data)
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formRating === 0) {
      setError('Please select a star rating.')
      return
    }

    setSubmitting(true)
    try {
      await createReview(productId, {
        rating: formRating,
        title: formTitle,
        body: formBody
      })
      setSuccess('Thank you for your review!')
      setShowForm(false)
      setFormRating(0)
      setFormTitle('')
      setFormBody('')
      await loadReviews() // refresh to show the new review
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Remove this review?')) return
    try {
      await deleteReview(reviewId)
      await loadReviews()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  if (loading) {
    return <div className="reviews-section"><p className="reviews-loading">Loading reviews…</p></div>
  }

  const { averageRating, totalReviews, ratingBreakdown, reviews } = summary || {}

  return (
    <div className="reviews-section">
      <h2 className="reviews-title">Customer Reviews</h2>

      {/* ---------- Rating Summary ---------- */}
      {totalReviews > 0 ? (
        <div className="reviews-summary">
          <div className="reviews-average">
            <span className="reviews-average-number">{averageRating}</span>
            <StarRating rating={Math.round(averageRating)} size={24} />
            <span className="reviews-count">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</span>
          </div>

          <div className="reviews-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingBreakdown?.[star] || 0
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={star} className="breakdown-row">
                  <span className="breakdown-label">{star} ★</span>
                  <div className="breakdown-bar-track">
                    <div
                      className="breakdown-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="breakdown-count">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="reviews-empty">No reviews yet. Be the first to review this product!</p>
      )}

      {/* ---------- Write a review ---------- */}
      <div className="reviews-write">
        {!user ? (
          <button
            className="btn btn-outline"
            onClick={() => navigate('/login')}
          >
            Log in to write a review
          </button>
        ) : myReview ? (
          <div className="my-review-notice">
            <p>You reviewed this product on {new Date(myReview.createdAt).toLocaleDateString('en-IN')}.</p>
            <button
              className="btn btn-outline"
              onClick={() => handleDelete(myReview.reviewId)}
            >
              Remove my review
            </button>
          </div>
        ) : (
          <>
            {!showForm ? (
              <button
                className="btn btn-outline"
                onClick={() => setShowForm(true)}
              >
                Write a Review
              </button>
            ) : (
              <form className="review-form" onSubmit={handleSubmit}>
                <h3>Your Review</h3>

                {error && <div className="error-banner">{error}</div>}

                <div className="form-field">
                  <label>Your Rating</label>
                  <StarRating
                    rating={formRating}
                    interactive
                    onRate={setFormRating}
                    size={28}
                  />
                </div>

                <div className="form-field">
                  <label>Title (optional)</label>
                  <input
                    placeholder="e.g. Beautiful necklace!"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    maxLength={150}
                  />
                </div>

                <div className="form-field">
                  <label>Your Review (optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Tell others what you thought about this piece…"
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    maxLength={1000}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setShowForm(false); setError('') }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
        {success && <p className="reviews-success">{success}</p>}
      </div>

      {/* ---------- Reviews list ---------- */}
      {reviews && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.reviewId} className="review-card">
              <div className="review-card-header">
                <div>
                  <StarRating rating={review.rating} size={16} />
                  {review.title && (
                    <p className="review-title">{review.title}</p>
                  )}
                </div>
                <div className="review-meta">
                  <span className="review-author">{review.userFullName}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {review.body && (
                <p className="review-body">{review.body}</p>
              )}

              {/* Admin can delete any review */}
              {user?.role === 'Admin' && (
                <button
                  className="review-delete-btn"
                  onClick={() => handleDelete(review.reviewId)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
