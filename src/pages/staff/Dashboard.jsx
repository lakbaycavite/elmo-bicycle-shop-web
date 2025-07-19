import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar userType="staff" />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl text-gray-900">This is staff dashboard</h1>
      </div>
    </div>
  )
}

export default Dashboard 