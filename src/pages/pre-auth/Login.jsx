import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, LogIn as LoginIcon } from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/images/logos/elmo.png" 
          alt="Elmo Bicycle Shop" 
          className="h-16 w-auto"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Login Page
        </h1>
        <p className="text-white/90">
          This is the Login Page
        </p>
      </div>

      {/* Mock Login Form */}
      <div className="bg-white rounded-lg p-8 shadow-lg w-80 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <button
            onClick={() => navigate('/customer/home')}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <LoginIcon size={20} />
            Login (Mock)
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-3 w-80">
        <button
          onClick={() => navigate('/signup')}
          className="flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          <UserPlus size={20} />
          Don't have an account? Sign Up
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default Login 