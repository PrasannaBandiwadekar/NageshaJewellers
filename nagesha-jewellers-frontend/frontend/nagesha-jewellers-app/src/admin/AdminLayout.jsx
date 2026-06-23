import { NavLink, Outlet } from 'react-router-dom'
import '../styles/admin.css'

export default function AdminLayout() {
  return (
    <div className="container admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Products
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Categories
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'is-active' : ''}>
            Orders
          </NavLink>
        </nav>
      </aside>

      <div className="admin-content">
        {/* Outlet renders whichever admin sub-page matches the URL */}
        <Outlet />
      </div>
    </div>
  )
}
