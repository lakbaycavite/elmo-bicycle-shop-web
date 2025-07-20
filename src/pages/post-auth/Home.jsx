import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar isLoggedIn={true} />
      
      {/* Main Content */}
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl text-gray-900 mb-4">Welcome to Elmo Bicycle Shop</h1>
          <p className="text-gray-600 mb-6">Your one-stop destination for quality bicycles and accessories</p>
          <button
            onClick={() => navigate('/customer/products')}
            className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home 