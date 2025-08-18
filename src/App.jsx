import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'react-phone-number-input/style.css';

// Pre-auth pages
import Login from './pages/pre-auth/Login';
import Signup from './pages/pre-auth/Signup';

// Unified HomePage component
import HomePage from './pages/HomePage';

// Post-auth pages
import Products from './pages/post-auth/Products';
import BikesCategory from './pages/post-auth/Bikes-category';
import AccessoriesCategory from './pages/post-auth/Accessories-category';
import GearsCategory from './pages/post-auth/Gears-category';
import Cart from './pages/post-auth/Cart';
import Wishlist from './pages/post-auth/Wishlist';
import CustomerProfile from './pages/post-auth/CustomerProfile';
import SpinTheWheel from './pages/post-auth/SpinTheWheel';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AccountManage from './pages/admin/AccountManage';
import OrdersOverview from './pages/admin/OrdersOverview';
import UserManagement from './pages/admin/UserManagement';
import UserInfo from './pages/admin/UserInfo';
import POS from './pages/admin/POS';
import Inventory from './pages/admin/Inventory';

// Staff pages
import StaffDashboard from './pages/staff/Dashboard';

import { useAuth } from './context/authContext/createAuthContext';
import { Toaster } from 'sonner';
import ProtectedRoute from './middleware/ProtectedRoute';

function App() {
  const { userLoggedIn } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          richColors
          toastOptions={{
            style: {
              fontSize: '',
              padding: '16px',
              minHeight: '75px',
              minWidth: '300px'
            }
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/customer/products" element={<Products />} /> {/* Shop is public */}

          {/* Pre-auth routes */}
          <Route path="/login" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Login />} />
          <Route path="/signup" element={userLoggedIn ? <Navigate to="/customer/home" /> : <Signup />} />

          {/* Customer-only routes (protected with email verification) */}
          <Route
            path="/customer/home"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bikes-category"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <BikesCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/accessories-category"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <AccessoriesCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/gears-parts-category"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <GearsCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/wishlist"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/cart"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/spin-wheel"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <SpinTheWheel />
              </ProtectedRoute>
            }
          />

          {/* Admin/Staff routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/account-manage"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <AccountManage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff-management"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders-overview"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <OrdersOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/user-info"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <UserInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pos"
            element={
              <ProtectedRoute requiredRoles={['admin', 'staff']}>
                <POS />
              </ProtectedRoute>
            }
          />

          {/* Category detail routes */}
          <Route
            path="/customer/bikes-category/:id"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <BikesCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/accessories-category/:id"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <AccessoriesCategory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/gears-category/:id"
            element={
              <ProtectedRoute requiredRoles={['customer']} requireEmailVerified={true}>
                <GearsCategory />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/customer/home" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
