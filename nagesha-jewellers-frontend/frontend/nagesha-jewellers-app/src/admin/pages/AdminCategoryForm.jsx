import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllCategoriesAdmin, createCategory, updateCategory } from '../../services/productService'
import { Spinner } from '../../components/Common.jsx'

const BLANK_FORM = {
  name: '',
  imageUrl: '',
  displayOrder: 0,
  isActive: true,
}

export default function AdminCategoryForm() {
  const { id } = useParams() // present only when editing
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(BLANK_FORM)
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return

    getAllCategoriesAdmin()
      .then((res) => {
        const existing = res.data.find((c) => c.categoryId === Number(id))
        if (existing) {
          setForm({
            name: existing.name,
            imageUrl: existing.imageUrl || '',
            displayOrder: existing.displayOrder,
            isActive: existing.isActive,
          })
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        name: form.name,
        imageUrl: form.imageUrl.trim() || null,
        displayOrder: parseInt(form.displayOrder, 10) || 0,
        isActive: form.isActive,
      }

      if (isEditing) {
        await updateCategory(id, payload)
      } else {
        await createCategory(payload)
      }

      navigate('/admin/categories')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not save this category. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="admin-form-page">
      <h1>{isEditing ? 'Edit Category' : 'Add New Category'}</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="category-form-layout">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-field">
            <label>Category Name</label>
            <input
              required
              placeholder="e.g. Earrings"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>Photo URL (shown as the circle image on the homepage)</label>
            <input
              placeholder="https://example.com/earrings.jpg"
              value={form.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
            />
            <p className="field-hint">
              Paste a direct image link. You can upload a photo to a free
              host like imgur.com and paste its direct image address here.
            </p>
          </div>

          <div className="form-field">
            <label>Display Order (lower numbers show first)</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
            />
          </div>

          <div className="checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              />
              Show this category on the website
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/categories')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>

        <div className="category-preview">
          <p className="field-hint" style={{ marginBottom: '0.6rem' }}>Preview</p>
          <div className="category-preview-circle">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <span>No photo yet</span>
            )}
          </div>
          <p className="category-preview-label">{form.name || 'Category Name'}</p>
        </div>
      </div>
    </div>
  )
}
