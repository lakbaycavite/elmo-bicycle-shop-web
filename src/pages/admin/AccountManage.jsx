import { useState, useEffect } from 'react';
import { AlertCircle, CircleUser, Loader2, Mail, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { createUserAsAdmin, doPasswordChange } from '../../firebase/auth';
import { useUserStatus } from '../../hooks/useUserStatus';
import { toast } from 'sonner';
import { doPasswordReset } from '../../firebase/auth';

function AccountManage() {
  const { users, loading, error, loadUsers, removeUser } = useUsers();
  const { disableUser, reactivateUser } = useUserStatus();

  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [accountToDisable, setAccountToDisable] = useState(null);
  const [accountToReactivate, setAccountToReactivate] = useState(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  //password reset
  const [resetPasswordAccount, setResetPasswordAccount] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);


  // Update accounts when users data changes
  useEffect(() => {
    if (users && users.length > 0) {
      setAccounts(users);
    }
  }, [users]);
  // Filter accounts based on available fields
  const filteredAccounts = accounts.filter(account => {
    // Search term filtering
    const searchFields = [
      account.firstName || '',
      account.lastName || '',
      account.displayName || '',
      account.email || '',
      account.role || ''
    ].map(field => field.toLowerCase());

    const matchesSearch = searchFields.some(field => field.includes(searchTerm.toLowerCase()));

    // Role filtering
    const matchesRole = roleFilter === 'all' || (account.role || 'customer') === roleFilter;

    // Return true only if both conditions are met
    return matchesSearch && matchesRole;
  });

  const handleActionChange = async (account, action) => {

    if (action === 'disable') {
      setAccountToDisable(account);
      setIsDisableModalOpen(true);
    }
    else if (action === 'action') {
      handleActionChange(null, ''); // Reset action
    }
    else if (action === 'delete') {
      setAccountToDelete(account);
      setIsDeleteModalOpen(true);
    } else if (action === 'reactivate') {
      setAccountToReactivate(account);
      setIsActivateModalOpen(true);
    } else if (action === 'reset-password') {
      setResetPasswordAccount(account);
      setShowResetModal(true);
    }
  };

  const handleAccountInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create user in Firebase Auth
      await createUserAsAdmin(
        newAccount.email,
        newAccount.password,
        {
          ...newAccount,
        },
      )
        .then(() => {
          toast.success('Account created successfully!');
        })

      setNewAccount({
        firstName: '',
        lastName: '',
        email: '',
        role: 'customer',
        password: ''
      });
      setIsAddAccountModalOpen(false);
    } catch (error) {
      toast.error(`Error creating account: ${error.message}`);
      console.error("Error creating account:", error);
    }
  };

  // const handleEditAccountInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setEditAccount(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  // const handleEditAccountSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!editAccount) return;
  //   try {
  //     await editUser(editAccount.id, {
  //       firstName: editAccount.firstName,
  //       lastName: editAccount.lastName,
  //       email: editAccount.email,
  //       role: editAccount.role,
  //     });
  //     toast.success('Account updated successfully!');
  //     setIsEditAccountModalOpen(false);
  //     setEditAccount(null);
  //   } catch (error) {
  //     toast.error(`Error updating account: ${error.message}`);
  //   }
  // };

  const handleDisableAccount = async () => {
    if (!accountToDisable) return;
    try {
      // await removeUser(accountToDelete.id);
      await disableUser({ uid: accountToDisable.id, reason: 'Account disabled by admin' });
      setIsDisableModalOpen(false);
      setAccountToDisable(null);
    } catch (error) {
      // Optionally show error feedback in the modal
      toast.error(`Error disabling account: ${error.message}`);
    }
  };

  const handleReactivateSubmit = async () => {
    if (accountToReactivate) {
      await reactivateUser({
        uid: accountToReactivate.id,
        reason: 'Administrative reactivation'
      });
      loadUsers(); // Reload users to get updated data
    }
    setAccountToReactivate(null);
    setIsActivateModalOpen(false);
  };

  const handleDeleteSubmit = async () => {
    if (accountToDelete) {
      await removeUser(accountToDelete.id);
      loadUsers();
    }
    setAccountToDelete(null);
    setIsDeleteModalOpen(false);


  }

  // Helper function to format user name
  const formatUserName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.displayName) {
      return user.displayName;
    } else {
      return user?.email || 'Unknown User';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  if (loading && accounts.length === 0) return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white justify-center items-center">
        <div className="text-xl">Loading accounts...</div>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white justify-center items-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    </AdminLayout>
  );

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsChangePasswordModalOpen(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    } else {
      await doPasswordChange(passwordData.currentPassword, passwordData.newPassword)
        .then(() => {
          toast.success('Password changed successfully!');
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setIsChangePasswordModalOpen(false);
        })
        .catch(() => {
          toast.error(`New password and confirm password do not match or wrong current password`);
        });
    }


  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordAccount) {
      toast.error("No account selected for password reset.");
      return;
    }
    setResetLoading(true);

    await doPasswordReset(resetPasswordAccount.email)
      .then(() => {
        toast.success(`Password reset email sent to ${resetPasswordAccount.email}`);
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
        toast.error(`Error sending password reset email`);
      })
      .finally(() => {
        setResetLoading(false);
        setShowResetModal(false);
        setResetPasswordAccount(null);
      })

  }

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetLoading(false);
  };

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="bg-orange-500 w-full py-4 px-6">
            <h1 className="text-white text-3xl font-bold">Admin Profile</h1>
          </div>

          <div className="flex items-center justify-between w-full mx-auto mt-8 bg-white shadow-xl p-6 rounded-lg mb-10">
            <div className="flex items-center space-x-6">
              <CircleUser className="h-20 w-20 text-purple-800 bg-gray-200 rounded-full p-2" />
              <div>
                <h2 className="text-2xl font-semibold text-black">ADMIN</h2>
                <p className="text-gray-600">Email Address: admin@elmo.com</p>
                <button
                  onClick={() => setIsAddAccountModalOpen(true)}
                  className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                  Add Account
                </button>
              </div>
            </div>

            <button
              onClick={
                () => setIsChangePasswordModalOpen(true)
              }
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
              Change Password
            </button>
          </div>

          <div className="bg-white shadow-xl rounded-lg w-full p-4">
            <label className="text-orange-500 text-bold text-2xl mb-4">
              <h1>Account Management</h1>
            </label>
            <div className='flex flex-row gap-4 mb-6'>
              <input
                type='text'
                placeholder='Search...'
                className="border-1 w-[300px] h-10 rounded-lg p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className='p-1 border-1 rounded-lg' onChange={(e) => setRoleFilter(e.target.value)} value={roleFilter}>
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
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
                    <th className="py-3 px-4 font-semibold">Date Created</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account, index) => (
                      <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                        <td className="py-3 px-4">{formatUserName(account)}</td>
                        <td className="py-3 px-4">{account.role ? account.role.charAt(0).toUpperCase() + account.role.slice(1) : 'Customer'}</td>
                        <td className="py-3 px-4">{account.email}</td>
                        <td className="py-3 px-4">{formatDate(account.dateCreated || account.createdAt)}</td>
                        <td className="py-3 px-4">
                          <select
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 text-center rounded shadow transition-colors duration-150 w-36"
                            onChange={(e) => handleActionChange(account, e.target.value)}
                            defaultValue="action"
                          >
                            <option value="action" selected disabled className='font-bold'>Action</option>
                            <option value="reset-password" className='font-bold'>Reset Password</option>
                            {account.accountStatus === 'disabled' ? (
                              <option value="reactivate" className='font-bold'>Reactivate</option>
                            ) : (
                              <option value="disable" className='font-bold'>Disable</option>
                            )}
                            <option value="delete" className='font-bold'>Delete</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-gray-800 text-white">
                      <td colSpan="5" className="py-4 px-4 text-center">
                        No accounts found. {loading ? 'Loading...' : 'Add an account to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Account Modal */}
          {isAddAccountModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-orange-500">Add New Account</h2>
                  <button
                    onClick={() => setIsAddAccountModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleAddAccountSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={newAccount.firstName}
                      onChange={handleAccountInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={newAccount.lastName}
                      onChange={handleAccountInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newAccount.email}
                      onChange={handleAccountInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Role</label>
                    <select
                      name="role"
                      value={newAccount.role}
                      onChange={handleAccountInputChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={newAccount.password}
                      onChange={handleAccountInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddAccountModalOpen(false)}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Add Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {isChangePasswordModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-orange-500">Change Password</h2>
                  <button
                    onClick={() => setIsChangePasswordModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleChangePassword}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordModalOpen(false)}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                      Save Change
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Disable Confirmation Modal */}
          {isDisableModalOpen && accountToDisable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-500">Confirm Disable</h2>
                  <button
                    onClick={() => { setIsDisableModalOpen(false); setAccountToDisable(null); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-800">Are you sure you want to delete the account for <span className="font-bold">{formatUserName(accountToDisable)}</span> (<span className="text-gray-600">{accountToDisable.email}</span>)?</p>
                </div>
                <div className="flex justify-end space-x-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsDisableModalOpen(false); setAccountToDisable(null); }}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDisableAccount}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          )}

          {isActivateModalOpen && accountToReactivate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-500">Confirm Reactivate</h2>
                  <button
                    onClick={() => { setIsActivateModalOpen(false); setAccountToReactivate(null); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-800">Are you sure you want to reactivate the account for <span className="font-bold">{formatUserName(accountToReactivate)}</span> (<span className="text-gray-600">{accountToReactivate.email}</span>)?</p>
                </div>
                <div className="flex justify-end space-x-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsActivateModalOpen(false); setAccountToReactivate(null); }}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReactivateSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reactivate
                  </button>
                </div>
              </div>
            </div>
          )}


          {isDeleteModalOpen && accountToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-500">Confirm Delete</h2>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false); setAccountToDelete(null); // Reset action
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-800">Are you sure you want to delete the account for <span className="font-bold">{formatUserName(accountToDelete)}</span> (<span className="text-gray-600">{accountToDelete.email}</span>)?</p>
                </div>
                <div className="flex justify-end space-x-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteModalOpen(false); setAccountToDelete(null); // Reset action
                    }}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSubmit}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {showResetModal && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">
                  {/* Modal Header */}
                  <div className="modal-header bg-stone-900 text-white border-0">
                    <h5 className="modal-title font-semibold">Reset Password</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={closeResetModal}
                      aria-label="Close"
                    >
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body p-4">
                    <div className="text-center mb-4">
                      <Mail className="w-12 h-12 mx-auto text-orange-500 mb-3" />
                      <h4 className="font-bold text-gray-800 mb-2">Confirm Password Reset</h4>
                      <p className="text-gray-600">
                        Do you want to send a password reset link to <span className="font-bold">{resetPasswordAccount ? formatUserName(resetPasswordAccount) : 'this account'}</span>?
                      </p>
                      <p className="text-sm text-gray-500 mt-3">
                        <AlertCircle className="w-4 h-4 inline-block mr-1" />
                        The user will receive an email with instructions to reset their password.
                      </p>
                    </div>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-4"
                        onClick={closeResetModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetSubmit}
                        className={`btn ${resetLoading ? 'btn-secondary' : 'btn-success text-white'} px-4 flex items-center justify-center`}
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <div className='flex items-center'>
                            <Loader2 className="w-4 h-4 me-2 animate-spin" />
                            Sending...
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AccountManage;