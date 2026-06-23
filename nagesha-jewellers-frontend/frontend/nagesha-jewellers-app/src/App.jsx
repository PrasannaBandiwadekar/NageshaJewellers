import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'

import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import Services from './pages/Services.jsx'
import OurStory from './pages/OurStory.jsx'
import Collections from './pages/Collections.jsx'
import Contact from './pages/Contact.jsx'

import AdminLayout from './admin/AdminLayout.jsx'
import AdminProducts from './admin/pages/AdminProducts.jsx'
import AdminProductForm from './admin/pages/AdminProductForm.jsx'
import AdminOrders from './admin/pages/AdminOrders.jsx'
import AdminCategories from './admin/pages/AdminCategories.jsx'
import AdminCategoryForm from './admin/pages/AdminCategoryForm.jsx'

// This file is the "map" of the whole website - every <Route> below
// matches a URL path to the page component that should be shown.
export default function App() {
  const { user } = useAuth()
  const { refreshCart } = useCart()

  // Whenever the logged-in user changes (login/logout), reload the cart
  // so it matches whichever account is currently signed in.
  useEffect(() => {
    refreshCart()
  }, [user])

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:categorySlug" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/contact" element={<Contact />} />

          {/* These pages require the customer to be logged in */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success/:orderNumber" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />

          {/* These pages require an Admin account */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminProducts />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="categories/new" element={<AdminCategoryForm />} />
            <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
