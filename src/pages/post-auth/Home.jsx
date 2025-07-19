import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl text-gray-900 mb-4">This is customer home page</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Back to Landing
        </button>
      </div>
    </div>
  )
}

export default Home 