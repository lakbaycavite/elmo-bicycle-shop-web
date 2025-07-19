import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Package, 
  BarChart3, 
  LogOut, 
  ShoppingCart, 
  DollarSign,
  Lock,
  Eye
} from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    { title: "Today's Revenue", value: "$1,250", icon: DollarSign, color: "green" },
    { title: "Orders Today", value: "23", icon: ShoppingCart, color: "blue" },
    { title: "Active Users", value: "156", icon: Users, color: "purple" },
    { title: "Products", value: "89", icon: Package, color: "orange" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/images/logos/elmo.png" 
                alt="Elmo Bicycle Shop" 
                className="h-10 w-auto mr-3"
              />
              <span className="text-xl font-bold text-gray-900">Elmo Bicycle Shop</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">STAFF</span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Staff Member!</span>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Dashboard
          </h1>
          <p className="text-gray-600">
            This is the Staff Dashboard - Limited administrative access
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
              <Eye className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">View Users</h3>
            <p className="text-gray-600 text-center mb-4">View customer information (read-only)</p>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View Users
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
              <Package className="text-orange-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Product Management</h3>
            <p className="text-gray-600 text-center mb-4">Edit and manage products</p>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Manage Products
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
              <Eye className="text-green-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">View Analytics</h3>
            <p className="text-gray-600 text-center mb-4">View sales reports (read-only)</p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              View Analytics
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Order Management</h3>
            <p className="text-gray-600 text-center mb-4">Process and track orders</p>
            <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Manage Orders
            </button>
          </div>

          {/* Restricted Access Cards */}
          <div className="bg-gray-100 rounded-lg shadow-md p-6 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg mb-4 mx-auto">
              <Lock className="text-gray-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 text-center mb-2">System Settings</h3>
            <p className="text-gray-500 text-center mb-4">Admin access required</p>
            <button 
              className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Access Denied
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg shadow-md p-6 opacity-60">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg mb-4 mx-auto">
              <Lock className="text-gray-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 text-center mb-2">Staff Management</h3>
            <p className="text-gray-500 text-center mb-4">Admin access required</p>
            <button 
              className="w-full bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              Access Denied
            </button>
          </div>
        </div>

        {/* Permissions Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Some features are restricted for staff accounts. Contact an administrator for full access permissions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 text-center">Quick Navigation</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => navigate('/customer/home')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Customer View
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard 