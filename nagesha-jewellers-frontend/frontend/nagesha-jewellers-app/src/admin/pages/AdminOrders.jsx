import { useEffect, useState } from 'react'
import { getAllOrdersAdmin, updateOrderStatus } from '../../services/cartOrderService'
import { Spinner } from '../../components/Common.jsx'
import '../../styles/orders.css'

const STATUS_OPTIONS = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled']

const STATUS_COLORS = {
  Pending: 'status-pending',
  Paid: 'status-paid',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = () => {
    setLoading(true)
    getAllOrdersAdmin()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error(err)
      alert('Could not update this order. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <h1>All Orders</h1>

      {orders.length === 0 ? (
        <p className="admin-empty-note">No orders have been placed yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.orderId}>
              <div className="order-card-header">
                <div>
                  <p className="order-number">{order.orderNumber}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {' · '}Payment: {order.paymentStatus}
                  </p>
                </div>

                <div className="admin-status-control">
                  <span className={`status-badge ${STATUS_COLORS[order.status] || ''}`}>
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.orderId}
                    onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
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
      )}
    </div>
  )
}
