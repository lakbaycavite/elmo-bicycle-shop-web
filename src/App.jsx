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
import AccessoriesCategory from './pages/post-auth/Accessories-category'
import GearsCategory from './pages/post-auth/Gears-category'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AccountManage from './pages/admin/AccountManage'
import OrdersOverview from './pages/admin/OrdersOverview';
import UserManagement from './pages/admin/UserManagement';
import UserActivity from './pages/admin/UserActivity';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'
import Cart from './pages/post-auth/Cart'
import Wishlist from './pages/post-auth/Wishlist';
import CustomerProfile from './pages/post-auth/CustomerProfile';
import Inventory from './pages/admin/Inventory';
import { useAuth } from './context/authContext/createAuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './middleware/ProtectedRoute';

function App() {

  const { userLoggedIn } = useAuth();
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors toastOptions={{
          style: {
            fontSize: '',
            padding: '16px',
            minHeight: '75px',
            minWidth: '300px'
          }
        }} />
        <Routes>
          {/* Home routes - using unified HomePage component */}
          {/* Home routes - using unified HomePage component */}
          <Route path="/" element={<HomePage />} />
          <Route path="/customer/home" element={<HomePage />} />

          {/* Pre-auth routes */}
          <Route path="/login" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Login />} />
          <Route path="/signup" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Signup />} />

          {/* Post-auth routes with ProtectedRoute */}
          <Route path="/customer/products" element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          } />
          <Route path="/customer/bikes-category" element={
            <ProtectedRoute>
              <BikesCategory />
            </ProtectedRoute>
          } />
          <Route path="/customer/accessories-category" element={
            <ProtectedRoute>
              <AccessoriesCategory />
            </ProtectedRoute>
          } />
          <Route path="/customer/gears-category" element={
            <ProtectedRoute>
              <AccessoriesCategory />
            </ProtectedRoute>
          } />
          <Route path="/customer/wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          } />
          <Route path="/customer/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />

          {/* Admin routes with role-based protection */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/account-manage" element={
            <ProtectedRoute>
              <AccountManage />
            </ProtectedRoute>
          } />
          <Route path="/admin/staff-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders-overview" element={
            <ProtectedRoute>
              <OrdersOverview />
            </ProtectedRoute>
          } />
          <Route path="/admin/user-activity" element={
            <ProtectedRoute>
              <UserActivity />
            </ProtectedRoute>
          } />

          {/* Staff routes with role-based protection */}
          {/* <Route path="/staff/dashboard" element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          } /> */}

          <Route path="*" element={<Navigate to="/customer/home" />} />


        </Routes>
      </div>
    </Router>
  )
}

export default App
