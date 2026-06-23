import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/productCard.css'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    setAdding(true)
    try {
      await addItem(product.productId, 1)
    } catch (err) {
      console.error(err)
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        ) : (
          <div className="image-placeholder" />
        )}
        {hasDiscount && <span className="sale-tag">-{discountPercent}%</span>}

        <button
          className="quick-add-btn"
          onClick={handleAddToCart}
          disabled={adding || product.stockQuantity === 0}
        >
          {product.stockQuantity === 0 ? 'Sold Out' : adding ? 'Adding…' : 'Add to Bag'}
        </button>
      </div>

      <div className="product-card-info">
        <p className="product-material">{product.material}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price-row">
          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="product-compare-price">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
