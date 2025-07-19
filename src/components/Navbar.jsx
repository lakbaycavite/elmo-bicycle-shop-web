import { useNavigate } from 'react-router-dom'

function Navbar({ isLoggedIn = false, userType = "customer" }) {
  const navigate = useNavigate()

  if (isLoggedIn) {
    // Post-auth navbar (for customers)
    return (
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/customer/home')}>
            <img 
              src="/images/logos/elmo.png" 
              alt="Elmo Bicycle Shop" 
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/customer/home')}
              className="text-gray-600 hover:text-orange-600"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/customer/products')}
              className="text-gray-600 hover:text-orange-600"
            >
              Products
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    )
  }

  // Pre-auth navbar (for homepage)
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
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
  )
}

export default Navbar 