import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../services/productService'
import ProductCard from '../components/ProductCard.jsx'
import { Spinner, EmptyState } from '../components/Common.jsx'
import RatesBanner from '../components/RatesBanner.jsx'
import '../styles/shop.css'

export default function Shop() {
  const { categorySlug } = useParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    setLoading(true)
    const params = categorySlug ? { categorySlug } : {}
    Promise.all([getProducts(params), getCategories()])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data)
        setCategories(catRes.data)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [categorySlug])

  const currentCategory = categories.find((c) => c.slug === categorySlug)

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    return 0
  })

  return (
    <>
      {/* Banner sits outside all containers so it stretches full width */}
      <RatesBanner />

      <div className="shop-page">
        <div className="page-header">
          <h1>{currentCategory ? currentCategory.name : 'Shop All Jewellery'}</h1>
          <p>{products.length} {products.length === 1 ? 'piece' : 'pieces'}</p>
        </div>

        <div className="container shop-layout">
          <aside className="shop-filters">
            <h4>Category</h4>
            <ul>
              <li>
                <Link to="/shop" className={!categorySlug ? 'is-active' : ''}>All</Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.categoryId}>
                  <Link
                    to={`/shop/${cat.slug}`}
                    className={categorySlug === cat.slug ? 'is-active' : ''}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="shop-main">
            <div className="shop-toolbar">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <Spinner />
            ) : sortedProducts.length === 0 ? (
              <EmptyState
                title="No products here yet"
                message="Check back soon, or browse another category."
              />
            ) : (
              <div className="product-grid">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.productId} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}