import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductBySlug } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js'
import { Spinner } from '../components/Common.jsx'
import StarRating from '../components/StarRating.jsx'
import ProductReviews from '../components/ProductReviews.jsx'
import RelatedProducts from '../components/RelatedProducts.jsx'
import RecentlyViewed from '../components/RecentlyViewed.jsx'
import { getProductReviews } from '../services/reviewService'
import '../styles/productDetail.css'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()
  const { addProduct } = useRecentlyViewed()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [reviewSummary, setReviewSummary] = useState(null)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res.data)
        setActiveImage(0)
        setQuantity(1)
        // Record this view in recently viewed (localStorage)
        addProduct(res.data)
        // Load review summary to show stars under the product name
        return getProductReviews(res.data.productId)
      })
      .then((res) => {
        setReviewSummary(res.data)
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true)
        else console.error(err)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addItem(product.productId, quantity)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <Spinner />

  if (notFound || !product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>We couldn't find that piece</h3>
          <p>It may have been removed or the link is incorrect.</p>
          <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
        </div>
      </div>
    )
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const inStock = product.stockQuantity > 0
  const isLivePriced = Boolean(product.metalType)

  return (
    <div className="container">
      {/* ---------- Main product section ---------- */}
      <div className="product-detail">
        {/* Image gallery */}
        <div className="pd-gallery">
          <div className="pd-main-image">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} />
            ) : (
              <div className="image-placeholder" />
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={i === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="pd-info">
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>

          {/* Star rating preview - clicking scrolls to reviews section */}
          {reviewSummary && reviewSummary.totalReviews > 0 && (
            <a
              href="#reviews"
              className="pd-rating-preview"
            >
              <StarRating rating={Math.round(reviewSummary.averageRating)} size={16} />
              <span>{reviewSummary.averageRating} ({reviewSummary.totalReviews} {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})</span>
            </a>
          )}

          <p className="pd-material">{product.material}</p>

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="pd-compare-price">
                ₹{Number(product.compareAtPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Live rate badge for gold/silver products */}
          {isLivePriced && (
            <p className="pd-live-rate-note">
              📊 Price updates automatically with live {product.metalType === 'Silver' ? 'silver' : 'gold'} rates
              · {product.weightInGrams}g · {product.makingChargePercent}% making charge
            </p>
          )}

          {!inStock && <p className="pd-stock-out">Currently sold out</p>}

          <p className="pd-description">{product.description}</p>

          <div className="pd-purchase-row">
            <div className="qty-selector">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!inStock}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                disabled={!inStock}
              >
                +
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={!inStock || adding}
            >
              {adding ? 'Adding…' : inStock ? 'Add to Bag' : 'Sold Out'}
            </button>
          </div>

          <div className="pd-meta">
            <p><strong>Material:</strong> {product.material}</p>
            <p><strong>Shipping:</strong> Free across India on orders above ₹999</p>
            <p><strong>Payment:</strong> Pay on delivery — cash or as arranged</p>
          </div>
        </div>
      </div>

      {/* ---------- Related Products ---------- */}
      <RelatedProducts
        currentProductId={product.productId}
        categorySlug={product.categorySlug}
      />

      {/* ---------- Recently Viewed ---------- */}
      <RecentlyViewed excludeProductId={product.productId} />

      {/* ---------- Reviews ---------- */}
      <div id="reviews">
        <ProductReviews productId={product.productId} />
      </div>
    </div>
  )
}
