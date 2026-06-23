import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '../../services/productService'
import { Spinner } from '../../components/Common.jsx'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProducts = () => {
    setLoading(true)
    getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Remove "${product.name}" from the shop? It will no longer be visible to customers.`)
    if (!confirmed) return

    try {
      await deleteProduct(product.productId)
      loadProducts()
    } catch (err) {
      console.error(err)
      alert('Could not remove this product. Please try again.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="admin-header-row">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.productId}>
              <td>
                <div className="admin-product-cell">
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} />}
                  <span>{p.name}</span>
                </div>
              </td>
              <td>{p.categoryName}</td>
              <td>₹{p.price.toLocaleString('en-IN')}</td>
              <td>{p.stockQuantity}</td>
              <td className="admin-actions-cell">
                <Link to={`/admin/products/${p.productId}/edit`}>Edit</Link>
                <button onClick={() => handleDelete(p)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && <p className="admin-empty-note">No products yet. Click "Add Product" to create your first one.</p>}
    </div>
  )
}
