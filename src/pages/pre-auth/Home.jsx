import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Home as HomeIcon } from 'lucide-react'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/images/logos/elmo.png" 
          alt="Elmo Bicycle Shop" 
          className="h-20 w-auto"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to Elmo Bicycle Shop
        </h1>
        <p className="text-white/90 text-lg">
          This is the Home Page (Not Logged In)
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          <LogIn size={20} />
          Login
        </button>

        <button
          onClick={() => navigate('/signup')}
          className="flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
        >
          <UserPlus size={20} />
          Sign Up
        </button>
      </div>

      {/* Mock Login Buttons for Testing */}
      <div className="mt-8 pt-8 border-t border-white/20">
        <p className="text-white/70 text-sm mb-4 text-center">Quick Access (Development Only)</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => navigate('/customer/home')}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
          >
            Customer View
          </button>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
          >
            Admin View
          </button>
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
          >
            Staff View
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home 