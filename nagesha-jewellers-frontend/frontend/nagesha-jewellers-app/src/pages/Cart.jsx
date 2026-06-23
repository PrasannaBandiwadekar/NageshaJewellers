import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { EmptyState, Spinner } from '../components/Common.jsx'
import '../styles/cart.css'

export default function Cart() {
  const { items, loading, subtotal, updateQuantity, removeItem } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (loading) return <Spinner />

  if (items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="Your bag is empty"
          message="Browse our collection and find something you love."
          actionLabel="Shop Now"
          onAction={() => navigate('/shop')}
        />
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <h1 className="cart-title">Your Bag</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-item" key={item.cartItemId}>
              <div className="cart-item-image">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <div className="image-placeholder" />}
              </div>

              <div className="cart-item-details">
                <p className="cart-item-name">{item.productName}</p>
                <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>

                <div className="cart-item-controls">
                  <div className="qty-selector">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeItem(item.cartItemId)}>
                    Remove
                  </button>
                </div>
              </div>

              <div className="cart-item-total">₹{item.lineTotal.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{subtotal >= 999 ? 'Free' : '₹49'}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{(subtotal >= 999 ? subtotal : subtotal + 49).toLocaleString('en-IN')}</span>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className="continue-link">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
