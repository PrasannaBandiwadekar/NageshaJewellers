import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getFeaturedProducts } from '../services/productService'
import ProductCard from '../components/ProductCard.jsx'
import { Spinner } from '../components/Common.jsx'
import '../styles/staticPages.css'

export default function Collections() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCategories(), getFeaturedProducts()])
      .then(([catRes, featRes]) => {
        setCategories(catRes.data)
        setFeatured(featRes.data)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="static-page">
      <div className="page-header">
        <p className="eyebrow">Collections</p>
        <h1>Find your everyday edit</h1>
        <p>Curated groupings, organised by how you actually wear jewellery.</p>
      </div>

      <div className="container">
        <div className="collections-banner-grid">
          {categories.map((cat) => (
            <Link to={`/shop/${cat.slug}`} key={cat.categoryId} className="collection-banner">
              {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} /> : <div className="image-placeholder" />}
              <div className="collection-banner-label">
                <h3>{cat.name}</h3>
                <span>Shop now →</span>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="section-title" style={{ marginTop: '3rem' }}>Editor's Picks</h2>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.productId} product={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
