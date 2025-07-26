import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { Loader2, Edit, UserX } from 'lucide-react';

function UserManagement() {
  const currentDateTime = '2025-07-26 10:09:03';
  const currentUserLogin = 'lanceballicud';

  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedPageAccess, setSelectedPageAccess] = useState('orders');

  // Inventory permissions state
  const [inventoryPermissions, setInventoryPermissions] = useState({
    addProduct: false,
    readProduct: false,
    editProduct: false,
    deleteProduct: false
  });

  const {
    users,
    loading,
    loadUsers,
    editUser,
  } = useUsers();

  // Filter to only show staff with active status
  const filteredAccounts = users.filter(account => {
    // First filter by staff role and active status
    const isStaffAndActive = account.role === 'staff' && account.accountStatus !== 'disabled';

    // Then apply search filtering if there's a search term
    const searchFilter = !searchTerm ||
      account?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Return true only if both conditions are met
    return isStaffAndActive && searchFilter;
  });

  // Open the edit modal with a staff account
  const openEditModal = (account) => {
    setSelectedAccount(account);

    // Set initial page access
    const pageAccess = account.pageAccess || 'orders';
    setSelectedPageAccess(pageAccess);

    // Set initial inventory permissions if they exist
    if (account.inventoryPermissions) {
      setInventoryPermissions({
        addProduct: account.inventoryPermissions.addProduct || false,
        readProduct: account.inventoryPermissions.readProduct || false,
        editProduct: account.inventoryPermissions.editProduct || false,
        deleteProduct: account.inventoryPermissions.deleteProduct || false
      });
    } else {
      // Default all to false if no existing permissions
      setInventoryPermissions({
        addProduct: false,
        readProduct: false,
        editProduct: false,
        deleteProduct: false
      });
    }

    setShowEditModal(true);
  };


  // Handle inventory permission checkbox changes
  const handlePermissionChange = (permission) => {
    setInventoryPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const handleEditSubmit = async () => {
    if (selectedAccount && selectedAccount.role === 'staff') {
      const updateData = {
        pageAccess: selectedPageAccess,
        accessUpdatedAt: currentDateTime,
        accessUpdatedBy: currentUserLogin
      };

      // Only include inventory permissions if inventory is selected
      if (selectedPageAccess === 'inventory') {
        updateData.inventoryPermissions = inventoryPermissions;
      }

      await editUser(selectedAccount.id, updateData);
      loadUsers(); // Reload users to get updated data
    }
    setShowEditModal(false);
  };

  // Format inventory permissions for display
  const formatInventoryPermissions = (account) => {
    if (account.pageAccess !== 'inventory' || !account.inventoryPermissions) {
      return null;
    }

    const permissions = [];
    const ip = account.inventoryPermissions;

    if (ip.readProduct) permissions.push('View');
    if (ip.addProduct) permissions.push('Add');
    if (ip.editProduct) permissions.push('Edit');
    if (ip.deleteProduct) permissions.push('Delete');

    return permissions.length > 0 ? `(${permissions.join(', ')})` : '(No permissions)';
  };

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 p-4">
          <div className="bg-white shadow-xl rounded-lg w-full p-4">
            <label className="text-orange-500 text-bold text-2xl mb-4">
              <h1>Active Staff</h1>
            </label>
            <div className='flex flex-row gap-4 mb-6'>
              <input
                type='text'
                placeholder='Search by name or email...'
                className="border-1 w-[300px] h-10 rounded-lg p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-black text-orange-400">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Page Access</th>
                    <th className="py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr className="bg-gray-800 text-white">
                      <td colSpan="4" className="py-8 px-4 text-center">
                        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                        <p className="mt-2">Loading staff data...</p>
                      </td>
                    </tr>
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account, index) => (
                      <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                        <td className="py-3 px-4">{account.firstName} {account.lastName}</td>
                        <td className="py-3 px-4">{account.email}</td>
                        <td className="py-3 px-4">
                          {account.pageAccess === 'orders' ? (
                            <span className="text-green-500 font-bold">Orders Overview</span>
                          ) : account.pageAccess === 'inventory' ? (
                            <div>
                              <span className="text-green-500 font-bold">Inventory</span>
                              <span className="text-gray-300 ml-1 text-sm">
                                {formatInventoryPermissions(account)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-yellow-500 font-bold">No Specific Access</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openEditModal(account)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded flex items-center"
                          >
                            <Edit size={16} className="mr-1" /> Edit Access
                          </button>

                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-gray-800 text-white">
                      <td colSpan="4" className="py-8 px-4 text-center">
                        {searchTerm ? (
                          <p>No active staff members found matching your search.</p>
                        ) : (
                          <p>No active staff members found in the system.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal with Inventory Permissions */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[450px]">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Edit Staff Access</h2>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Staff:</span> {selectedAccount.firstName} {selectedAccount.lastName}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold">Email:</span> {selectedAccount.email}
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-semibold">Page Access:</label>
                <select
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedPageAccess}
                  onChange={(e) => setSelectedPageAccess(e.target.value)}
                >
                  <option value="orders">Orders Overview</option>
                  <option value="inventory">Inventory</option>
                </select>
              </div>

              {/* Inventory permissions section */}
              {selectedPageAccess === 'inventory' && (
                <div className="mt-4 border-t pt-4">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    Inventory Permissions:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="readProduct"
                        checked={inventoryPermissions.readProduct}
                        onChange={() => handlePermissionChange('readProduct')}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="readProduct" className="ml-2 block text-sm text-gray-700">
                        View Products (read access)
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="addProduct"
                        checked={inventoryPermissions.addProduct}
                        onChange={() => handlePermissionChange('addProduct')}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="addProduct" className="ml-2 block text-sm text-gray-700">
                        Add New Products
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="editProduct"
                        checked={inventoryPermissions.editProduct}
                        onChange={() => handlePermissionChange('editProduct')}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="editProduct" className="ml-2 block text-sm text-gray-700">
                        Edit Existing Products
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="deleteProduct"
                        checked={inventoryPermissions.deleteProduct}
                        onChange={() => handlePermissionChange('deleteProduct')}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="deleteProduct" className="ml-2 block text-sm text-gray-700">
                        Delete Products
                      </label>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 italic">
                    * Select at least one permission for this staff member to access inventory
                  </p>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Last updated: {currentDateTime} by {currentUserLogin}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleEditSubmit}
                disabled={selectedPageAccess === 'inventory' &&
                  !Object.values(inventoryPermissions).some(v => v)}
              >
                {loading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </AdminLayout>
  );
}

export default UserManagement;