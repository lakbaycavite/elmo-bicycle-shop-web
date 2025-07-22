import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import 'react-phone-number-input/style.css';

// Pre-auth pages
import Login from './pages/pre-auth/Login'
import Signup from './pages/pre-auth/Signup'

// Unified HomePage component
import HomePage from './pages/HomePage'

// Post-auth pages
import Products from './pages/post-auth/Products'
import BikesCategory from './pages/post-auth/Bikes-category'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import OrdersOverview from './pages/admin/OrdersOverview';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import Cart from './pages/post-auth/Cart'
import Wishlist from './pages/post-auth/Wishlist';
import CustomerProfile from './pages/post-auth/CustomerProfile';
import Inventory from './pages/admin/Inventory';
import { useAuth } from './context/authContext/createAuthContext';

function App() {

  const { userLoggedIn } = useAuth();
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home routes - using unified HomePage component */}
          <Route path="/" element={<HomePage />} />
          <Route path="/customer/home" element={<HomePage />} />

          {/* Pre-auth routes */}
          <Route path="/login" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Login />} />
          <Route path="/signup" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Signup />} />

          {/* Post-auth routes */}
          <Route path="/customer/products" element={<Products />} />
          <Route path="/customer/bikes-category" element={<BikesCategory />} />
          <Route path="/customer/wishlist" element={<Wishlist />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />

          <Route path="/customer/cart" element={<Cart />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/orders-overview" element={<OrdersOverview />} />

          {/* Staff routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />


        </Routes>
      </div>
    </Router>
  )
}

export default App
