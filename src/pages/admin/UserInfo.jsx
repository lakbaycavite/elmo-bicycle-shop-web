import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';

function UserInfo() {
  const { users, loading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter users to only show customers and staff
 const filteredAccounts = users.filter(user => {
  const isValidRole = !selectedRole || selectedRole === 'all'
    ? (user.role === 'customer' || user.role === 'staff')
    : user.role === selectedRole;

  if (!isValidRole) return false;

const matchesStatus =
  selectedStatus === 'all' ||
  (selectedStatus === 'active' && user.accountStatus !== 'disabled') ||
  user.accountStatus === selectedStatus;

if (!matchesStatus) return false;


  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  return (
    (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
    (user.email && user.email.toLowerCase().includes(searchLower))
  );
});


  // Helper function to format user name
  const formatUserName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.displayName) {
      return user.displayName;
    } else {
      return user.email || 'Unknown User';
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);

  // Loading state
  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen bg-white justify-center items-center">
          <div className="text-xl">Loading users...</div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen bg-white justify-center items-center">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 p-10 sm:p-4">
          <div className="bg-white shadow-xl rounded-lg w-full p-6 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h1><span className="font-semibold text-xl sm:text-4xl">USERS</span></h1>
              <div className="text-xs sm:text-sm text-gray-500">
                {filteredAccounts.length} users found
              </div>
            </div>

           <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6'>
  <input
    type='text'
    placeholder='Search by name or email...'
    className="border border-gray-300 w-full sm:w-[300px] h-10 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }}
  />
  <select
    className='p-2 border border-gray-300 rounded-lg h-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
    value={selectedRole}
    onChange={(e) => {
      setSelectedRole(e.target.value);
      setCurrentPage(1);
    }}
  >
    <option value="all">All Roles</option>
    <option value="customer">Customer</option>
    <option value="staff">Staff</option>
  </select>
  <select
    id="statusFilter"
    className="p-2 border border-gray-300 rounded-lg h-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    value={selectedStatus}
    onChange={(e) => {
      setSelectedStatus(e.target.value);
      setCurrentPage(1);
    }}
  >
    <option value="all">All</option>
    <option value="active">Active</option>
    <option value="disabled">Disabled</option>
  </select>
</div>


            {/* Responsive Table */}
            <div className="overflow-x-auto mb-4">
              <div className="min-w-full overflow-hidden">
                {/* Desktop Table */}
                <table className="hidden sm:table min-w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-orange-400">
                      <th className="py-3 px-2 sm:px-4 font-semibold text-left">Name</th>
                      <th className="py-3 px-2 sm:px-4 font-semibold text-left">Role</th>
                      <th className="py-3 px-2 sm:px-4 font-semibold text-left">Email</th>
                      <th className="py-3 px-2 sm:px-4 font-semibold text-left">Phone No#</th>
                      <th className="py-3 px-2 sm:px-4 font-semibold text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((user, index) => (
                        <tr key={user.id || index} className="bg-gray-800 text-white border-b border-gray-700">
                          <td className="py-3 px-2 sm:px-4">{formatUserName(user)}</td>
                          <td className="py-3 px-2 sm:px-4">
                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                          </td>
                          <td className="py-3 px-2 sm:px-4">{user.email}</td>
                          <td className="py-3 px-2 sm:px-4">{user.phone || user.phoneNumber || ''}</td>
                          <td className={`py-3 px-2 sm:px-4 ${user.accountStatus === 'disabled' ? 'text-red-500' : 'text-green-500'}`}>
                            {user.accountStatus === 'disabled' ? 'Disabled' : 'Active'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-gray-800 text-white">
                        <td colSpan="100%" className="text-center py-6 text-gray-400 text-sm bg-gray-100 rounded-md">
                          No users found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-2">
                  {currentItems.length > 0 ? (
                    currentItems.map((user, index) => (
                      <div key={user.id || index} className="bg-gray-800 text-white p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{formatUserName(user)}</p>
                            <p className="text-sm text-gray-300">{user.email}</p>
                          </div>
                          <span className={`text-xs ${user.accountStatus === 'disabled' ? 'text-red-500' : 'text-green-500'}`}>
                            {user.accountStatus === 'disabled' ? 'Disabled' : 'Active'}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-sm">
                            <span className="font-semibold">Role:</span> {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                      No users found matching your filters.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {filteredAccounts.length > itemsPerPage && (
              <div className="flex justify-center mt-4">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Show limited page numbers on mobile */}
                  <div className="hidden sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${currentPage === number
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>

                  {/* Mobile pagination - shows current page and total */}
                  <div className="sm:hidden flex items-center px-3 border-t border-b border-gray-300 bg-white">
                    <span className="text-xs text-gray-700">
                      {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default UserInfo;