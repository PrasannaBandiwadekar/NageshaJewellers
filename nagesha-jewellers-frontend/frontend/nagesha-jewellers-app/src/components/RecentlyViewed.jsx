import { Link } from 'react-router-dom'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js'
import '../styles/recentlyViewed.css'

// Shows the last 6 products this customer viewed, stored in localStorage.
// No login or backend needed — purely browser-side memory.
export default function RecentlyViewed({ excludeProductId }) {
  const { recentlyViewed } = useRecentlyViewed()

  // Exclude the current product from the recently viewed list
  const items = recentlyViewed.filter(
    (p) => p.productId !== excludeProductId
  )

  if (items.length === 0) return null

  return (
    <div className="recently-section">
      <h2 className="recently-title">Recently Viewed</h2>
      <div className="recently-grid">
        {items.map((product) => (
          <Link
            to={`/product/${product.slug}`}
            key={product.productId}
            className="recently-card"
          >
            <div className="recently-card-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} loading="lazy" />
              ) : (
                <div className="image-placeholder" />
              )}
            </div>
            <p className="recently-card-name">{product.name}</p>
            <p className="recently-card-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
