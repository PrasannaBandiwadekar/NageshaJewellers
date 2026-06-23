import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkout } from '../services/cartOrderService'
import '../styles/checkout.css'

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    shippingFullName: user?.fullName || '',
    shippingPhone: '',
    shippingLine1: '',
    shippingLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingPostalCode: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // PAY ON DELIVERY: we just tell the backend the shipping details.
      // It creates the Order immediately (no payment gateway step), and
      // we go straight to the confirmation page. The shop owner will
      // collect payment in person / on delivery, and update order status
      // from the Admin panel.
      //
      // NOTE FOR LATER: when online payment is added back, this is the
      // spot to re-introduce opening the Razorpay popup using
      // orderResponse.razorpayOrderId / razorpayKeyId, the same way it
      // worked before this change.
      const { data: orderResponse } = await checkout(form)

      await refreshCart()
      navigate(`/order-success/${orderResponse.orderNumber}`)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Something went wrong while placing your order. Please try again.')
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items, navigate])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="container checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Shipping Address</h3>

          {error && <div className="error-banner">{error}</div>}

          <div className="form-field">
            <label>Full Name</label>
            <input name="shippingFullName" value={form.shippingFullName} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Phone Number</label>
            <input name="shippingPhone" value={form.shippingPhone} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Address Line 1</label>
            <input name="shippingLine1" value={form.shippingLine1} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>Address Line 2 (optional)</label>
            <input name="shippingLine2" value={form.shippingLine2} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>City</label>
              <input name="shippingCity" value={form.shippingCity} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>State</label>
              <input name="shippingState" value={form.shippingState} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-field">
            <label>Postal Code</label>
            <input name="shippingPostalCode" value={form.shippingPostalCode} onChange={handleChange} required />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#5C5142', background: '#F3ECE2', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            💰 Pay with cash (or as arranged) when your order is delivered or picked up. No online payment is needed right now.
          </p>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place Order — Pay ₹${subtotal.toLocaleString('en-IN')} on Delivery`}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div className="summary-line-item" key={item.cartItemId}>
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.lineTotal.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
