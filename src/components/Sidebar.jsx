import { useNavigate } from 'react-router-dom'

function Sidebar({ userType = "admin" }) {
  const navigate = useNavigate()

  const isAdmin = userType === "admin"
  const panelTitle = isAdmin ? "Admin Panel" : "Staff Panel"

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <img 
          src="/images/logos/elmo.png" 
          alt="Elmo Bicycle Shop" 
          className="h-10 w-auto mb-2"
        />
        <h2 className="text-sm font-semibold">{panelTitle}</h2>
      </div>
      
      <nav className="space-y-2">
        {isAdmin && (
          <>
            <div className="px-3 py-2 font-bold text-orange-400 uppercase cursor-default select-none">
              INVENTORY
            </div>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">
              USER ACTIVITY
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700" onClick={() => navigate('/admin/orders-overview')}>
              ORDERS OVERVIEW
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">
              USER MANAGEMENT
            </button>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">
              ACCOUNT MANAGE
            </button>
          </>
        )}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <button
          onClick={() => navigate('/')} 
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-red-300"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar 