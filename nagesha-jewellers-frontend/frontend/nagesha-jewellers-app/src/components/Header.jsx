import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import '../styles/header.css'

const NAV_LINKS = [
  { label: 'Earrings', slug: 'earrings' },
  { label: 'Necklaces', slug: 'necklaces' },
  { label: 'Bracelets', slug: 'bracelets' },
  { label: 'Rings', slug: 'rings' },
]

const INFO_LINKS = [
  { label: 'Collections', path: '/collections' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Services', path: '/services' },
  { label: 'Contact', path: '/contact' },
]

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { itemCount } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setAccountOpen(false)
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="announcement-bar">
        Free shipping across India on orders above ₹9999
      </div>

      <div className="container header-inner">
        {/* Hamburger - only shown on mobile */}
        <button
          className="mobile-menu-btn"
          aria-label="Open menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="logo">
          Nagesha
          <span className="logo-sub">Jewellers</span>
        </Link>

        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.slug}
              to={`/shop/${link.slug}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="nav-shop-all">
            Shop All
          </Link>
          <span className="nav-divider" />
          {INFO_LINKS.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="account-menu">
            <button
              className="icon-btn"
              aria-label="Account"
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <UserIcon />
            </button>
            {accountOpen && (
              <div className="account-dropdown" onMouseLeave={() => setAccountOpen(false)}>
                {user ? (
                  <>
                    <p className="account-greeting">Hi, {user.fullName.split(' ')[0]}</p>
                    <Link to="/my-orders" onClick={() => setAccountOpen(false)}>My Orders</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)}>Admin Panel</Link>
                    )}
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setAccountOpen(false)}>Log in</Link>
                    <Link to="/register" onClick={() => setAccountOpen(false)}>Create account</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <BagIcon />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 20c1.5-4 4-5.5 7.5-5.5s6 1.5 7.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 8h12l-1 12.5a1 1 0 01-1 .9H8a1 1 0 01-1-.9L6 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
