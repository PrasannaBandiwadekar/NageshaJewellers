import { useEffect, useState } from 'react'
import { getMyOrders } from '../services/cartOrderService'
import { Spinner, EmptyState } from '../components/Common.jsx'
import { useNavigate } from 'react-router-dom'
import '../styles/orders.css'

const STATUS_COLORS = {
  Pending: 'status-pending',
  Paid: 'status-paid',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  if (orders.length === 0) {
    return (
      <div className="container">
        <EmptyState
          title="No orders yet"
          message="When you place an order, it will show up here."
          actionLabel="Start Shopping"
          onAction={() => navigate('/shop')}
        />
      </div>
    )
  }

  return (
    <div className="container orders-page">
      <h1 className="page-title">My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div className="order-card" key={order.orderId}>
            <div className="order-card-header">
              <div>
                <p className="order-number">{order.orderNumber}</p>
                <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>
                {order.status}
              </span>
            </div>

            <div className="order-items-list">
              {order.items.map((item, i) => (
                <div className="order-line-item" key={i}>
                  <span>{item.productName} × {item.quantity}</span>
                  <span>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span>Total</span>
              <span className="order-total">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
