import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllCategoriesAdmin, deleteCategory } from '../../services/productService'
import { Spinner } from '../../components/Common.jsx'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCategories = () => {
    setLoading(true)
    getAllCategoriesAdmin()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Remove "${category.name}"? If it still has products in it, it will be hidden instead of deleted.`
    )
    if (!confirmed) return

    try {
      const res = await deleteCategory(category.categoryId)
      if (res.data?.message) {
        alert(res.data.message)
      }
      loadCategories()
    } catch (err) {
      console.error(err)
      alert('Could not remove this category. Please try again.')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="admin-header-row">
        <h1>Categories</h1>
        <Link to="/admin/categories/new" className="btn btn-primary">+ Add Category</Link>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Order</th>
            <th>Visible on Site</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.categoryId}>
              <td>
                <div className="admin-category-thumb">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} />
                  ) : (
                    <div className="admin-category-thumb-empty">No photo</div>
                  )}
                </div>
              </td>
              <td>{cat.name}</td>
              <td>{cat.displayOrder}</td>
              <td>
                <span className={cat.isActive ? 'status-badge status-paid' : 'status-badge status-cancelled'}>
                  {cat.isActive ? 'Visible' : 'Hidden'}
                </span>
              </td>
              <td className="admin-actions-cell">
                <Link to={`/admin/categories/${cat.categoryId}/edit`}>Edit</Link>
                <button onClick={() => handleDelete(cat)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <p className="admin-empty-note">No categories yet. Click "Add Category" to create your first one.</p>
      )}
    </div>
  )
}
