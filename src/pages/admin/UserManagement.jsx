import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { Loader2, Edit } from 'lucide-react';
import { useAuth } from '../../context/authContext/createAuthContext';

function UserManagement() {
  const { currentUser } = useAuth();

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
    const isStaffAndActive = account.role === 'staff' && account.accountStatus !== 'disabled';
    const searchFilter = !searchTerm ||
      account?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isStaffAndActive && searchFilter;
  });

  // Open the edit modal with a staff account
  const openEditModal = (account) => {
    setSelectedAccount(account);
    const pageAccess = account.pageAccess || 'orders';
    setSelectedPageAccess(pageAccess);

    if (account.inventoryPermissions) {
      setInventoryPermissions({
        addProduct: account.inventoryPermissions.addProduct || false,
        readProduct: account.inventoryPermissions.readProduct || false,
        editProduct: account.inventoryPermissions.editProduct || false,
        deleteProduct: account.inventoryPermissions.deleteProduct || false
      });
    } else {
      setInventoryPermissions({
        addProduct: false,
        readProduct: false,
        editProduct: false,
        deleteProduct: false
      });
    }

    setShowEditModal(true);
  };

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
        accessUpdatedAt: new Date().toISOString(),
        accessUpdatedBy: currentUser?.email || 'Admin'
      };

      if (selectedPageAccess === 'inventory') {
        updateData.inventoryPermissions = inventoryPermissions;
      } else {
        updateData.inventoryPermissions = null;
      }

      try {
        await editUser(selectedAccount.id, updateData);
        loadUsers();
      } catch (error) {
        console.error("Error updating user access:", error);
      }
    }
    setShowEditModal(false);
  };

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
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white shadow-xl rounded-lg w-full p-4 md:p-6">
            <label className="text-orange-500 font-bold text-xl md:text-2xl mb-4">
              <h1>Active Staff</h1>
            </label>
            <div className='flex flex-col sm:flex-row gap-4 mb-6'>
              <input
                type='text'
                placeholder='Search by name or email...'
                className="border border-gray-300 w-full sm:w-[300px] h-10 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full overflow-hidden">
                <div className="hidden md:block">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-black text-orange-400">
                        <th className="py-3 px-4 font-semibold text-left">Name</th>
                        <th className="py-3 px-4 font-semibold text-left">Email</th>
                        <th className="py-3 px-4 font-semibold text-left">Page Access</th>
                        <th className="py-3 px-4 font-semibold text-left">Actions</th>
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
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded flex items-center text-sm md:text-base"
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

                {/* Mobile view */}
                <div className="md:hidden space-y-4">
                  {loading ? (
                    <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                      <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                      <p className="mt-2">Loading staff data...</p>
                    </div>
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account, index) => (
                      <div key={index} className="bg-gray-800 text-white p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{account.firstName} {account.lastName}</p>
                            <p className="text-sm text-gray-300">{account.email}</p>
                          </div>
                          <button
                            onClick={() => openEditModal(account)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded flex items-center text-xs"
                          >
                            <Edit size={14} className="mr-1" /> Edit
                          </button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-sm">
                            <span className="font-semibold">Access:</span>{" "}
                            {account.pageAccess === 'orders' ? (
                              <span className="text-green-500">Orders Overview</span>
                            ) : account.pageAccess === 'inventory' ? (
                              <span>
                                <span className="text-green-500">Inventory</span>
                                <span className="text-gray-300 ml-1">
                                  {formatInventoryPermissions(account)}
                                </span>
                              </span>
                            ) : (
                              <span className="text-yellow-500">No Specific Access</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                      {searchTerm ? (
                        <p>No active staff members found matching your search.</p>
                      ) : (
                        <p>No active staff members found in the system.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Edit Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                Last updated: {selectedAccount.accessUpdatedAt || 'Never'}
                {selectedAccount.accessUpdatedBy ? ` by ${selectedAccount.accessUpdatedBy}` : ''}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
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
                  <Loader2 className='animate-spin mx-auto' />
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