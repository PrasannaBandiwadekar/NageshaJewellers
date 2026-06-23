import { Link } from 'react-router-dom'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <p className="logo footer-logo">Nagesha<span className="logo-sub">Jewellers</span></p>
          <p className="footer-tagline">
            Thoughtfully designed gold &amp; silver-plated jewellery,
            made for everyday wear.
          </p>
        </div>

        <div className="footer-col">
          <h4>Shop</h4>
          <Link to="/shop/earrings">Earrings</Link>
          <Link to="/shop/necklaces">Necklaces</Link>
          <Link to="/shop/bracelets">Bracelets</Link>
          <Link to="/shop/rings">Rings</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/our-story">Our Story</Link>
          <Link to="/services">Services</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/my-orders">Track Order</Link>
        </div>

        <div className="footer-col">
          <h4>Visit Our Store</h4>
          <p className="footer-address">
            Nagesha Jewellers<br />
            Opposite Ganapati Mandir, Main Road<br />
            Shirol, Tal- Shirol<br />
            Dist- Kolhapur, Maharashtra.
          </p>
          <a href="mailto:bandiwadekarprasanna@gmail.com">bandiwadekarprasanna@gmail.com</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} Nagesha Jewellers. All rights reserved.</p>
      </div>
    </footer>
  )
}
