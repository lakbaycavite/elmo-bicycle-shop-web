import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { useUserStatus } from '../../hooks/useUserStatus';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/authContext/createAuthContext';

function UserManagement() {
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedPageAccess, setSelectedPageAccess] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [reactivateReason, setReactivateReason] = useState('');

  const {
    users,
    loading,
    loadUsers,
    editUser,
  } = useUsers();

  const {
    disableUser,
    reactivateUser,
    loading: statusLoading,
  } = useUserStatus();

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

  const handleActionChange = (account, action) => {
    setSelectedAccount(account);

    if (action === 'edit') {
      // Set the initial page access value for staff
      setSelectedPageAccess(account.pageAccess || 'orders');
      setShowEditModal(true);
    } else if (action === 'disable') {
      setDisableReason('');
      setShowDisableModal(true);
    } else if (action === 'reactivate') {
      setReactivateReason('');
      setShowReactivateModal(true);
    }
  };

  const handleEditSubmit = async () => {
    if (selectedAccount && selectedAccount.role === 'staff') {
      await editUser(selectedAccount.id, {
        pageAccess: selectedPageAccess,
        accessUpdatedAt: Date.now(),
        accessUpdatedBy: currentUser.email
      });

      loadUsers(); // Reload users to get updated data
    }
    setShowEditModal(false);
  };

  const handleDisableSubmit = async () => {
    if (selectedAccount && disableReason.trim()) {
      await disableUser({
        uid: selectedAccount.id,
        reason: disableReason
      });
      loadUsers(); // Reload users to get updated data
    }
    setShowDisableModal(false);
  };

  const handleReactivateSubmit = async () => {
    if (selectedAccount) {
      await reactivateUser({
        uid: selectedAccount.id,
        reason: reactivateReason || 'Administrative reactivation'
      });
      loadUsers(); // Reload users to get updated data
    }
    setShowReactivateModal(false);
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
                    <th className="py-3 px-4 font-semibold">Action</th>
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
                            <span className="text-green-500 font-bold">Inventory</span>
                          ) : (
                            <span className="text-yellow-500 font-bold">No Specific Access</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150"
                            onChange={(e) => handleActionChange(account, e.target.value)}
                            value=""
                          >
                            <option value="" disabled className='font-bold'>Select Action</option>
                            <option value="edit" className='font-bold'>Edit Access</option>
                            <option value="disable" className='font-bold'>Disable</option>
                          </select>
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

      {/* Edit Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-orange-500">Edit Staff Access</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Staff: {selectedAccount.firstName} {selectedAccount.lastName}</p>
              <label className="block text-gray-700 mb-2">Page Access:</label>
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={selectedPageAccess}
                onChange={(e) => setSelectedPageAccess(e.target.value)}
              >
                <option value="orders">Orders Overview</option>
                <option value="inventory">Inventory</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                * Staff will only have access to the selected page
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

      {/* Disable Modal */}
      {showDisableModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-red-500">Disable Staff Member</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Staff: {selectedAccount.firstName} {selectedAccount.lastName}</p>
              <p className="text-gray-700 mb-4">Email: {selectedAccount.email}</p>

              <label className="block text-gray-700 mb-2">Reason for disabling:</label>
              <textarea
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Please provide a reason for disabling this staff member"
              ></textarea>
              {disableReason.trim() === '' && (
                <p className="text-sm text-red-500 mt-1">Reason is required</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowDisableModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleDisableSubmit}
                disabled={disableReason.trim() === ''}
              >
                {statusLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  'Disable Staff'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal - kept for completeness but won't be shown in this view */}
      {showReactivateModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-green-500">Reactivate Staff Member</h2>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Staff: {selectedAccount.firstName} {selectedAccount.lastName}</p>
              <p className="text-gray-700 mb-4">Email: {selectedAccount.email}</p>

              {selectedAccount.disabledReason && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedAccount.disabledReason ? `Reason for disabling: ${selectedAccount.disabledReason}` : 'No reason provided for disabling this staff member.'}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                onClick={() => setShowReactivateModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleReactivateSubmit}
              >
                Reactivate Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default UserManagement;