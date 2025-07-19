import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, LogOut, ShoppingCart, Bike } from 'lucide-react'

function Products() {
  const navigate = useNavigate()

  const mockProducts = [
    { id: 1, name: "Mountain Bike Pro", price: "$899", category: "Mountain" },
    { id: 2, name: "Road Bike Speed", price: "$1299", category: "Road" },
    { id: 3, name: "City Cruiser", price: "$599", category: "City" },
    { id: 4, name: "Electric Bike", price: "$1899", category: "Electric" }
  ]

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

      {/* Navigation Bar */}
      <nav className="bg-orange-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/customer/home')}
              className="flex items-center gap-2 hover:text-orange-200 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
            
            <button
              onClick={() => navigate('/customer/home')}
              className="flex items-center gap-2 hover:text-orange-200 transition-colors"
            >
              <Home size={18} />
              Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products Page
          </h1>
          <p className="text-gray-600">
            This is the Products Page - Browse our bicycle collection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-lg mb-4 mx-auto">
                <Bike className="text-orange-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 text-center mb-2">{product.category}</p>
              <p className="text-xl font-bold text-orange-600 text-center mb-4">{product.price}</p>
              <button className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Categories Filter (Placeholder) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {["All", "Mountain", "Road", "City", "Electric"].map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Quick Navigation</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/customer/home')}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <Home size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Products 