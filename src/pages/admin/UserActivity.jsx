import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';

function UserActivity() {
  const { users, loading, error } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  // Filter users to only show customers and staff
  const filteredAccounts = users.filter(user => {
    // First filter by role - only include customers and staff
    const isValidRole = !selectedRole || selectedRole === 'all'
      ? (user.role === 'customer' || user.role === 'staff')
      : user.role === selectedRole;

    if (!isValidRole) return false;

    // Then filter by search term across multiple fields
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
        <div className="flex-1 p-4">
          <div className="bg-white shadow-xl rounded-lg w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <label className="text-orange-500 text-bold text-2xl">
                <h1>USERS</h1>
              </label>
              {/* <div className="text-sm text-gray-500">
                {users.length} users • Last updated: {Date.now().toLocaleString()}
              </div> */}
            </div>

            <div className='flex flex-row gap-4 mb-6'>
              <input
                type='text'
                placeholder='Search by name or email...'
                className="border-1 w-[300px] h-10 rounded-lg p-2"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <select
                className='p-1 border-1 rounded-lg'
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-black text-orange-400">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((user, index) => (
                      <tr key={user.id || index} className="bg-gray-800 text-white border-b border-gray-700">
                        <td className="py-3 px-4">{formatUserName(user)}</td>
                        <td className="py-3 px-4">
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'}
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className={`py-3 px-4 ${user.accountStatus === 'disabled' ? 'text-red-500' : 'text-green-500'
                          }`}>
                          {user.accountStatus === 'disabled' ? 'Disabled' : 'Active'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-gray-800 text-white">
                      <td colSpan="4" className="py-4 px-4 text-center">
                        No users found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAccounts.length > itemsPerPage && (
              <div className="flex justify-center mt-4">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

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

                  <button
                    onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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

export default UserActivity;