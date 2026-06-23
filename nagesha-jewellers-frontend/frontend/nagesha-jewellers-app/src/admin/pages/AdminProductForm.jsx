import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProducts, createProduct, updateProduct } from '../../services/productService'
import { getCategories } from '../../services/productService'
import { Spinner } from '../../components/Common.jsx'

const BLANK_FORM = {
  name: '',
  description: '',
  material: '',
  price: '',
  compareAtPrice: '',
  stockQuantity: '',
  sku: '',
  categoryId: '',
  isFeatured: false,
  isActive: true,
  images: [''], // one empty image-URL field to start
}

export default function AdminProductForm() {
  const { id } = useParams() // present only when editing
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState(BLANK_FORM)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(res.data)
        if (isEditing) {
          loadProductForEdit(res.data)
        }
      })
      .catch((err) => console.error(err))
  }, [id])

  const loadProductForEdit = (categoryList) => {
    getProducts()
      .then((res) => {
        const existing = res.data.find((p) => p.productId === Number(id))
        if (existing) {
          setForm({
            name: existing.name,
            description: existing.description || '',
            material: existing.material || '',
            price: existing.price,
            compareAtPrice: existing.compareAtPrice || '',
            stockQuantity: existing.stockQuantity,
            sku: '',
            categoryId: categoryList.find((c) => c.slug === existing.categorySlug)?.categoryId || '',
            isFeatured: existing.isFeatured,
            isActive: true,
            images: existing.images?.length ? existing.images : [''],
          })
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleImageChange = (index, value) => {
    const newImages = [...form.images]
    newImages[index] = value
    setForm({ ...form, images: newImages })
  }

  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ''] })
  }

  const removeImageField = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Please select a category.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        material: form.material,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stockQuantity: parseInt(form.stockQuantity, 10),
        sku: form.sku,
        categoryId: parseInt(form.categoryId, 10),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        images: form.images.filter((url) => url.trim() !== ''),
      }

      if (isEditing) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }

      navigate('/admin/products')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Could not save this product. Please check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="admin-form-page">
      <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-field">
          <label>Product Name</label>
          <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>

        <div className="form-field">
          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Material</label>
            <input
              placeholder="e.g. 18k Gold Plated"
              value={form.material}
              onChange={(e) => handleChange('material', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Category</label>
            <select required value={form.categoryId} onChange={(e) => handleChange('categoryId', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Price (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>Compare-at Price (₹) — optional, for showing a sale</label>
            <input
              type="number"
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => handleChange('compareAtPrice', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Stock Quantity</label>
            <input
              type="number"
              required
              value={form.stockQuantity}
              onChange={(e) => handleChange('stockQuantity', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>SKU (optional)</label>
            <input value={form.sku} onChange={(e) => handleChange('sku', e.target.value)} />
          </div>
        </div>

        <div className="form-field">
          <label>Product Images (image URLs)</label>
          {form.images.map((url, i) => (
            <div className="image-input-row" key={i}>
              <input
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => handleImageChange(i, e.target.value)}
              />
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImageField(i)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" className="add-image-btn" onClick={addImageField}>+ Add another image</button>
          <p className="field-hint">
            Paste a direct image link. If you don't have one yet, you can use a placeholder like
            https://via.placeholder.com/600x750 for testing.
          </p>
        </div>

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => handleChange('isFeatured', e.target.checked)}
            />
            Show on homepage "Trending Now"
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
