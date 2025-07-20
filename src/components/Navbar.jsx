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
    <nav className="bg-black px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}> 
          <img 
            src="/images/logos/elmo.png" 
            alt="Elmo Bicycle Shop" 
            className="h-10 w-auto"
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-4 pr-10 py-2 rounded border border-gray-600 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:border-orange-600"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Navigation Links & Auth Buttons */}
        <div className="flex items-center gap-6">
          <button className="text-white hover:text-orange-500 font-normal">Home</button>
          <button className="text-white hover:text-orange-500 font-normal">Shop</button>
          <button className="text-white hover:text-orange-500 font-normal">About</button>
          <button className="text-white hover:text-orange-500 font-normal">Contact</button>
          <button
            onClick={() => navigate('/login')}
            className="ml-4 text-white font-bold hover:text-orange-500"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="ml-2 px-4 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 