import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Horizontal Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/images/logos/elmo.png" 
              alt="Elmo Bicycle Shop" 
              className="h-10 w-auto"
            />
          </div>

          {/* Login/Signup Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-orange-600 hover:text-orange-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

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