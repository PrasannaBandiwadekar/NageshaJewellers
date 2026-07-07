import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import ProductCard from './ProductCard.jsx'
import '../styles/relatedProducts.css'

// Shows up to 4 products from the same category, excluding the
// current product, at the bottom of the product detail page.
export default function RelatedProducts({ currentProductId, categorySlug }) {
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (!categorySlug) return

    getProducts({ categorySlug })
      .then((res) => {
        // Filter out the current product, take max 4
        const filtered = res.data
          .filter((p) => p.productId !== currentProductId)
          .slice(0, 4)
        setRelated(filtered)
      })
      .catch((err) => console.error('Related products fetch failed:', err))
  }, [currentProductId, categorySlug])

  if (related.length === 0) return null

  return (
    <div className="related-section">
      <h2 className="related-title">You Might Also Like</h2>
      <div className="related-grid">
        {related.map((p) => (
          <ProductCard key={p.productId} product={p} />
        ))}
      </div>
    </div>
  )
}
