import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Home as HomeIcon, LogOut, User } from 'lucide-react'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/images/logos/elmo.png" 
                alt="Elmo Bicycle Shop" 
                className="h-10 w-auto mr-3"
              />
              <span className="text-xl font-bold text-gray-900">Elmo Bicycle Shop</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Customer!</span>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Home Page
          </h1>
          <p className="text-gray-600">
            This is the Customer Home Page (Logged In)
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
              <ShoppingBag className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Products</h3>
            <p className="text-gray-600 text-center mb-4">Browse our bicycle collection</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              View Products
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
              <User className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Profile</h3>
            <p className="text-gray-600 text-center mb-4">Manage your account</p>
            <button
              className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
              <HomeIcon className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Orders</h3>
            <p className="text-gray-600 text-center mb-4">View your order history</p>
            <button
              className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 text-center">Quick Navigation</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Products
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home 