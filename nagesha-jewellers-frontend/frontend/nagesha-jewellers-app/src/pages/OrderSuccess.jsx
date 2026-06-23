import { useParams, Link } from 'react-router-dom'
import '../styles/common.css'

export default function OrderSuccess() {
  const { orderNumber } = useParams()

  return (
    <div className="container">
      <div className="empty-state" style={{ padding: '5rem 1rem' }}>
        <h3>Thank you for your order!</h3>
        <p>
          Your order <strong>{orderNumber}</strong> has been placed successfully.
          We'll send a confirmation to your email shortly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/my-orders" className="btn btn-outline">View My Orders</Link>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}
