import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { useUserStatus } from '../../hooks/useUserStatus';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/authContext/createAuthContext';

function UserManagement() {

  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
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

  const filteredAccounts = users.filter(account => {
    const searchFilter = account?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleFilter = selectedRole === 'all' || selectedRole === '' || account.role.toLowerCase() === selectedRole.toLowerCase();
    return searchFilter && roleFilter;
  });

  const handleActionChange = (account, action) => {
    setSelectedAccount(account);

    if (action === 'edit') {
      // Set the initial page access value for staff
      if (account.role === 'staff') {
        setSelectedPageAccess(account.pageAccess || 'orders');
        setShowEditModal(true);
      }
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

      // Log the access change to history if needed
      // await editUser(selectedAccount.id, {
      //   [`accessHistory/${Date.now()}`]: {
      //     type: 'page_access_update',
      //     timestamp: Date.now(),
      //     recordedAt: currentDateTime,
      //     by: currentUserLogin,
      //     pageAccess: selectedPageAccess
      //   }
      // });
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
              <h1>Staffs and Customers</h1>
            </label>
            <div className='flex flex-row gap-4 mb-6'>
              <input
                type='text'
                placeholder='Search...'
                className="border-1 w-[300px] h-10 rounded-lg p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className='p-1 border-1 rounded-lg' onChange={(e) => setSelectedRole(e.target.value)} value={selectedRole}>
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-black text-orange-400">
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                    <th className="py-3 px-4 font-semibold">Page Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account, index) => (
                    <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                      <td className="py-3 px-4">{account.firstName} {account.lastName}</td>
                      <td className="py-3 px-4">{account.role}</td>
                      <td className="py-3 px-4">{account.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded ${account.accountStatus === 'disabled' ? 'bg-red-500' : 'bg-green-500'}`}>
                          {account.accountStatus === 'disabled' ? 'Disabled' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150"
                          onChange={(e) => handleActionChange(account, e.target.value)}
                          value=""
                        >
                          <option value="" disabled className='font-bold'>Select Action</option>

                          {/* Show Edit only for staff */}
                          {account.role === 'staff' && account.accountStatus !== 'disabled' && (
                            <option value="edit" className='font-bold'>Edit Access</option>
                          )}

                          {/* Show Disable for active accounts */}
                          {account.accountStatus !== 'disabled' && (
                            <option value="disable" className='font-bold'>Disable</option>
                          )}


                          {account.accountStatus === 'disabled' && (
                            <option value="reactivate" className='font-bold'>Reactivate</option>
                          )}
                        </select>
                      </td>
                      <td className="">
                        {account.pageAccess === 'orders' ? (
                          <span className="text-green-500 font-bold">Orders Overview</span>
                        ) : account.pageAccess === 'inventory' ? (
                          <span className="text-green-500 font-bold">Inventory</span>
                        ) : account.role === "admin" ? (
                          <span className="text-green-500 font-bold">All Pages</span>
                        ) : (
                          <span className="text-red-500 font-bold">No Access</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {
        showEditModal && selectedAccount && (
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
        )
      }

      {/* Disable Modal */}
      {
        showDisableModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4 text-red-500">Disable User</h2>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">User: {selectedAccount.firstName} {selectedAccount.lastName}</p>
                <p className="text-gray-700 mb-4">Role: {selectedAccount.role}</p>

                <label className="block text-gray-700 mb-2">Reason for disabling:</label>
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  placeholder="Please provide a reason for disabling this user"
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
                    <>
                      Disable User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Reactivate Modal */}
      {
        showReactivateModal && selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4 text-green-500">Reactivate User</h2>

              <div className="mb-4">
                <p className="text-gray-700 mb-2">User: {selectedAccount.firstName} {selectedAccount.lastName}</p>
                <p className="text-gray-700 mb-4">Role: {selectedAccount.role}</p>

                {
                  selectedAccount.disabledReason && (
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedAccount.disabledReason ? `Reason for disabling: ${selectedAccount.disabledReason}` : 'No reason provided for disabling this user.'}
                    </p>
                  )
                }

                {/* <label className="block text-gray-700 mb-2">Reason for reactivation (optional):</label>
                <textarea
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  value={reactivateReason}
                  onChange={(e) => setReactivateReason(e.target.value)}
                  placeholder="Optional reason for reactivating this user"
                ></textarea> */}
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
                  Reactivate User
                </button>
              </div>
            </div>
          </div>
        )
      }
    </AdminLayout >
  );
}

export default UserManagement;