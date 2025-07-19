import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl text-gray-900">This is login page</h1>
      </div>

      {/* Bottom Buttons */}
      <div className="pb-8 flex gap-4">
        <button
          onClick={() => navigate('/signup')}
          className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default Login 