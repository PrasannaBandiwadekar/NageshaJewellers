import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts, getCategories } from '../services/productService'
import ProductCard from '../components/ProductCard.jsx'
import { Spinner } from '../components/Common.jsx'
import '../styles/home.css'

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [tone, setTone] = useState('gold') // signature interaction: gold <-> silver tint

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getCategories()])
      .then(([prodRes, catRes]) => {
        setFeatured(prodRes.data)
        setCategories(catRes.data)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={`home tone-${tone}`}>
      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Everyday fine jewellery</p>
            <h1>
              Small pieces,
              <br />
              worn every day.
            </h1>
            <p className="hero-desc">
              Dainty gold and silver-plated jewellery designed in-house,
              made for layering, gifting, and the moments in between.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary">Shop now</Link>
            </div>

            {/* Signature element: toggling the metal tint changes the hero's accent color */}
            <div className="material-toggle">
              <span className="material-toggle-label">Shown in</span>
              <button
                className={tone === 'gold' ? 'is-active' : ''}
                onClick={() => setTone('gold')}
              >
                Gold
              </button>
              <button
                className={tone === 'silver' ? 'is-active' : ''}
                onClick={() => setTone('silver')}
              >
                Silver
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-frame">
              <HeroIllustration tone={tone} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CATEGORY GRID ---------- */}
      <section className="container category-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link to={`/shop/${cat.slug}`} key={cat.categoryId} className="category-tile">
              <div className="category-tile-image">
                {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} /> : <div className="image-placeholder" />}
              </div>
              <p>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section className="container featured-section">
        <div className="section-heading-row">
          <h2 className="section-title">Trending Now</h2>
          <Link to="/shop" className="view-all-link">View All →</Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.productId} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- BRAND STRIP ---------- */}
      <section className="brand-strip">
        <div className="container brand-strip-grid">
          <div>
            <h4>Tarnish-Resistant</h4>
            <p>Plated to last through daily wear.</p>
          </div>
          <div>
            <h4>Designed In-House</h4>
            <p>Every piece sketched and finished by our own team.</p>
          </div>
          <div>
            <h4>Free Shipping</h4>
            <p>On all orders above ₹9999, across India.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// A simple inline SVG illustration that recolors based on the gold/silver
// toggle - this is the "signature" piece from the design plan, rather
// than depending on a real photo asset.
function HeroIllustration({ tone }) {
  const metal = tone === 'gold' ? '#B8935F' : '#B8BEC4'
  const metalDeep = tone === 'gold' ? '#9C7A47' : '#8E959C'

  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="160" r="92" stroke={metal} strokeWidth="3" />
      <circle cx="200" cy="160" r="92" stroke={metalDeep} strokeWidth="1" strokeDasharray="2 6" />
      <path d="M200 252 C 160 290, 150 340, 170 400 C 185 430, 215 430, 230 400 C 250 340, 240 290, 200 252 Z"
            stroke={metal} strokeWidth="3" fill="none" />
      <circle cx="200" cy="160" r="14" fill={metal} />
      <circle cx="140" cy="120" r="5" fill={metalDeep} />
      <circle cx="262" cy="195" r="4" fill={metalDeep} />
      <circle cx="200" cy="380" r="6" fill={metal} />
    </svg>
  )
}
