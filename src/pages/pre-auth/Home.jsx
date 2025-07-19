import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar isLoggedIn={false} />

      {/* Main Content */}
      <main className="flex items-center justify-center h-96">
        <h1 className="text-2xl text-gray-900">This is homepage</h1>
      </main>

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
              onClick={() => navigate('/staff/dashboard')}
              className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
            >
              Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home 