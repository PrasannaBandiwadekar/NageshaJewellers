import { useState, useEffect } from 'react'

const STORAGE_KEY = 'nj_recently_viewed'
const MAX_ITEMS = 6

// Custom hook that manages a list of recently viewed products.
// Stored in localStorage so it persists when the customer refreshes
// or comes back later. No backend or login required.
//
// Usage in any component:
//   const { recentlyViewed, addProduct } = useRecentlyViewed()
export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Call this when a product page loads to record the view
  const addProduct = (product) => {
    if (!product?.productId) return

    setRecentlyViewed((prev) => {
      // Remove the product if it's already in the list (avoids duplicates)
      const filtered = prev.filter((p) => p.productId !== product.productId)

      // Add to the front (most recently viewed first), cap at MAX_ITEMS
      const updated = [
        {
          productId: product.productId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          categorySlug: product.categorySlug,
          metalType: product.metalType,
        },
        ...filtered,
      ].slice(0, MAX_ITEMS)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // localStorage can fail if the browser is in private mode
        // or storage is full — silently continue
      }

      return updated
    })
  }

  return { recentlyViewed, addProduct }
}
