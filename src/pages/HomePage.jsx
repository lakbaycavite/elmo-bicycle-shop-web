import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'

function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determine if user is authenticated based on the current route
  const isAuthenticated = location.pathname === '/customer/home'

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar isLoggedIn={isAuthenticated} />

      {/* Main Content */}
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl text-gray-900 mb-4">Welcome to Elmo Bicycle Shop</h1>
          <p className="text-gray-600 mb-6">Your one-stop destination for quality bicycles and accessories</p>
          
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/customer/products')}
              className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Browse Products
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Quick Access (Development Only) */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <p className="text-xs text-gray-600 mb-2">Quick Access</p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/customer/home')}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Customer
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs"
            >
              Admin
            </button>
            <button
              onClick={() => navigate('/customer/Bikes-category')}
              className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
            >
              Bikes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 