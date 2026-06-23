import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProductBySlug } from '../services/productService'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Common.jsx'
import '../styles/productDetail.css'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    getProductBySlug(slug)
      .then((res) => {
        setProduct(res.data)
        setActiveImage(0)
        setQuantity(1)
      })
      .catch(() => setNotFound(true))
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

  return (
    <div className="container product-detail">
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

      <div className="pd-info">
        <p className="eyebrow">{product.categoryName}</p>
        <h1>{product.name}</h1>
        <p className="pd-material">{product.material}</p>

        <div className="pd-price-row">
          <span className="pd-price">₹{product.price.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="pd-compare-price">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {!inStock && <p className="pd-stock-out">Currently sold out</p>}

        <p className="pd-description">{product.description}</p>

        <div className="pd-purchase-row">
          <div className="qty-selector">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={!inStock}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} disabled={!inStock}>+</button>
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
        </div>
      </div>
    </div>
  )
}
