import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import 'react-phone-number-input/style.css';

// Pre-auth pages
import Home from './pages/pre-auth/Home'
import Login from './pages/pre-auth/Login'
import Signup from './pages/pre-auth/Signup'

// Post-auth pages
import CustomerHome from './pages/post-auth/Home'
import Products from './pages/post-auth/Products'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Pre-auth routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Post-auth routes */}
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/products" element={<Products />} />
          
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Staff routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
