import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function Products() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar isLoggedIn={true} userType="customer" />
      
      {/* Main Content */}
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h1 className="text-2xl text-gray-900 mb-4">This is products page</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Landing
          </button>
        </div>
      </div>
    </div>
  )
}

export default Products 