import { useState, useEffect } from 'react';
import { AlertCircle, CircleUser, Loader2, Mail, X, Edit, Camera } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useUsers } from '../../hooks/useUser';
import { createUserAsAdmin, doPasswordChange, doEmailChange, doSendEmailChangeVerification, checkEmailVerificationStatus, refreshUserVerificationStatus } from '../../firebase/auth';
import { useUserStatus } from '../../hooks/useUserStatus';
import { toast } from 'sonner';
import { doPasswordReset } from '../../firebase/auth';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { useAuth } from '../../context/authContext/createAuthContext';


function AccountManage() {
  const { users, loading, error, loadUsers, removeUser, editUser, currentUserData, getUserProfile } = useUsers();
  const { disableUser, reactivateUser } = useUserStatus();
  const { uploadImage, uploading: imageUploading, progress } = useCloudinaryUpload();
  const { currentUser } = useAuth();
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);


  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
   phoneNumber: '',
    role: 'customer',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    currentPassword: '',
    newEmail: '',
    confirmEmail: ''
  });
  const [emailVerified, setEmailVerified] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [accountToDisable, setAccountToDisable] = useState(null);
  const [accountToReactivate, setAccountToReactivate] = useState(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Edit profile state
  const [editProfile, setEditProfile] = useState({
    firstName: '',
    lastName: '',
    image: null
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  // Initialize edit profile data when modal opens
  useEffect(() => {
    if (isEditProfileModalOpen && currentUserData) {
      setEditProfile({
        firstName: currentUserData.firstName || '',
        lastName: currentUserData.lastName || '',
        image: currentUserData.image || null
      });
      setImagePreview(currentUserData.image || null);
      setSelectedImage(null);
    }
  }, [isEditProfileModalOpen, currentUserData]);

  // Check email verification status when modal opens
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (isChangeEmailModalOpen && currentUser) {
        try {
          setCheckingVerification(true);
          const status = await refreshUserVerificationStatus();
          setEmailVerified(status.emailVerified);
        } catch (error) {
          console.error("Error checking verification status:", error);
          setEmailVerified(false);
        } finally {
          setCheckingVerification(false);
        }
      }
    };

    checkVerificationStatus();
  }, [isChangeEmailModalOpen, currentUser]);

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
    const matchesAdmin = account.role !== 'admin';

    // Return true only if both conditions are met
    return matchesSearch && matchesRole && matchesAdmin;
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

  const handleEmailInputChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfileInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileUpdateLoading(true);

    try {
      let profileImageUrl = editProfile.image;

      // Upload new image if selected
      if (selectedImage) {
        profileImageUrl = await uploadImage(selectedImage, 'users');
      }

      // Prepare the updated data - only include changed fields
      const updatedProfileData = {
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        image: profileImageUrl,
      };

      // Update user in database using the current user's UID
      await editUser(currentUser.uid, updatedProfileData);

      // Refresh current user data from database
      await getUserProfile();

      // Close modal and clean up
      setIsEditProfileModalOpen(false);
      setSelectedImage(null);
      setImagePreview(null);

      // Clean up preview URL
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }


    } catch (error) {
      toast.error(`Error updating profile: ${error.message}`);
      console.error("Error updating profile:", error);
    } finally {
      setProfileUpdateLoading(false); // Fixed: was setting to true instead of false
    }
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
      return user?.email || 'User';
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

  // Helper function to format admin name
  const formatAdminName = () => {
    if (currentUserData?.firstName && currentUserData?.lastName) {
      return `${currentUserData.firstName} ${currentUserData.lastName}`;
    }
    return currentUserData?.firstName || 'ADMIN';
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

  const handleChangeEmail = async (e) => {
    e.preventDefault();

    if (emailData.newEmail !== emailData.confirmEmail) {
      toast.error("New email and confirm email do not match.");
      return;
    }

    if (!emailData.currentPassword) {
      toast.error("Current password is required to change email.");
      return;
    }

    try {
      const result = await doEmailChange(emailData.currentPassword, emailData.newEmail);

      if (result.success) {
        toast.success('Email changed successfully!');
        // Refresh user data
        await getUserProfile();

        // Reset form and close modal
        setEmailData({
          currentPassword: '',
          newEmail: '',
          confirmEmail: ''
        });
        setIsChangeEmailModalOpen(false);
      } else if (result.requiresVerification) {
        toast.warning('Verification email sent! Please check your current email, click the verification link, then try changing your email again.');
        // Don't close modal, let user try again after verification
        setEmailVerified(false);
      } else if (result.adminRequired) {
        toast.error(result.message);
      } else if (result.requiresReauth) {
        toast.warning(result.message);
        // Close modal and suggest re-login
        setEmailData({
          currentPassword: '',
          newEmail: '',
          confirmEmail: ''
        });
        setIsChangeEmailModalOpen(false);
      }
    } catch (error) {
      if (error.message.includes('auth/email-already-in-use')) {
        toast.error('This email is already in use by another account.');
      } else if (error.message.includes('auth/invalid-email')) {
        toast.error('Please enter a valid email address.');
      } else if (error.message.includes('auth/wrong-password')) {
        toast.error('Current password is incorrect.');
      } else if (error.message.includes('auth/requires-recent-login')) {
        toast.error('Please sign out and sign in again before changing your email.');
      } else {
        toast.error(`Error changing email: ${error.message}`);
      }
      console.error("Error changing email:", error);
    }
  };

  const handleRefreshVerification = async () => {
    try {
      setCheckingVerification(true);
      const status = await refreshUserVerificationStatus();
      setEmailVerified(status.emailVerified);

      if (status.emailVerified) {
        toast.success('Email verification confirmed! You can now change your email.');
      } else {
        toast.warning('Email is still not verified. Please check your email and click the verification link.');
      }
    } catch (error) {
      toast.error('Error checking verification status.');
      console.error("Error refreshing verification:", error);
    } finally {
      setCheckingVerification(false);
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
        <div className="flex-1 p-2 sm:p-4">
          {/* Header */}
          <div className="bg-orange-500 w-full py-3 sm:py-4 px-4 sm:px-6">
            <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold">Admin Profile</h1>
          </div>

          {/* Profile Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full mx-auto mt-4 sm:mt-8 bg-white shadow-md sm:shadow-xl p-4 sm:p-6 rounded-lg mb-6 sm:mb-10 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-4 md:space-x-6 w-full sm:w-auto">
              <div className="relative">
                {currentUserData?.image ? (
                  <img
                    src={currentUserData.image}
                    alt="Admin Profile"
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <CircleUser className="h-16 w-16 sm:h-20 sm:w-20 text-purple-800 bg-gray-200 rounded-full p-2" />
                )}
              </div>
              <div className="text-center sm:text-left mt-2 sm:mt-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-black">{formatAdminName()}</h2>
                <p className="text-sm sm:text-base text-gray-600">Email Address: {currentUserData?.email}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-3">
                  <button
                    onClick={() => setIsAddAccountModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base"
                  >
                    Add Account
                  </button>
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base"
              >
                Change Password
              </button>
              <button
                onClick={() => setIsChangeEmailModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base flex items-center gap-1"
              >
                <Mail className="h-4 w-4" />
                Change Email
              </button>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white shadow-md sm:shadow-xl rounded-lg w-full p-3 sm:p-4">
            <h1 className="text-orange-500 font-bold text-xl sm:text-2xl mb-3 sm:mb-4">
              Account Management
            </h1>
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6'>
              <input
                type='text'
                placeholder='Search...'
                className="border border-gray-300 w-full sm:w-[250px] md:w-[300px] h-10 rounded-lg p-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className='p-2 border border-gray-300 rounded-lg h-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                onChange={(e) => setRoleFilter(e.target.value)}
                value={roleFilter}
              >
                <option value="all">All Roles</option>
                <option value="staff">Staff</option>
                {/* <option value="admin">Admin</option> */}
              </select>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full overflow-hidden">
                {/* Desktop Table */}
                <table className="hidden sm:table min-w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-orange-400">
                      <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-left">Name</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-left">Role</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-left">Email</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-left">Date Created</th>
                      <th className="py-2 sm:py-3 px-2 sm:px-4 font-semibold text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account, index) => (
                        <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">{formatUserName(account)}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            {account.role ? account.role.charAt(0).toUpperCase() + account.role.slice(1) : 'Customer'}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">{account.email}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">{formatDate(account.dateCreated || account.createdAt)}</td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <select
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-1 sm:px-2 text-center rounded shadow transition-colors duration-150 w-full sm:w-36 text-xs sm:text-sm"
                              onChange={(e) => handleActionChange(account, e.target.value)}
                              defaultValue="action"
                            >
                              <option value="action" disabled className='font-bold'>Action</option>
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

                {/* Mobile Cards */}
                <div className="sm:hidden space-y-3">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account, index) => (
                      <div key={index} className="bg-gray-800 text-white p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold">{formatUserName(account)}</p>
                            <p className="text-sm text-gray-300">{account.email}</p>
                          </div>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {account.role ? account.role.charAt(0).toUpperCase() + account.role.slice(1) : 'Customer'}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-sm">
                            <span className="font-semibold">Created:</span> {formatDate(account.dateCreated || account.createdAt)}
                          </p>
                          <select
                            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-2 w-full rounded text-sm"
                            onChange={(e) => handleActionChange(account, e.target.value)}
                            defaultValue="action"
                          >
                            <option value="action" disabled>Select Action</option>
                            <option value="reset-password">Reset Password</option>
                            {account.accountStatus === 'disabled' ? (
                              <option value="reactivate">Reactivate</option>
                            ) : (
                              <option value="disable">Disable</option>
                            )}
                            <option value="delete">Delete</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-800 text-white p-4 rounded-lg text-center">
                      No accounts found. {loading ? 'Loading...' : 'Add an account to get started.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditProfileModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-orange-500">Edit Profile</h2>
                  <button
                    onClick={() => {
                      setIsEditProfileModalOpen(false);
                      if (imagePreview && imagePreview.startsWith('blob:')) {
                        URL.revokeObjectURL(imagePreview);
                      }
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleEditProfileSubmit}>
                  {/* Profile Image Upload */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Profile Image</label>
                    <div className="flex flex-col items-center">
                      <div className="relative mb-3">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <CircleUser className="h-20 w-20 text-purple-800 bg-gray-200 rounded-full p-2" />
                        )}
                        <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 cursor-pointer">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {imageUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editProfile.firstName}
                      onChange={handleEditProfileInputChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editProfile.lastName}
                      onChange={handleEditProfileInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditProfileModalOpen(false);
                        if (imagePreview && imagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                      disabled={imageUploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                      disabled={imageUploading}
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Account Modal */}
          {isAddAccountModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

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
                      {/* <option value="admin">Admin</option> */}
                    </select>
                  </div>
<div className="mb-4">
  <label className="block text-gray-700 mb-2">Phone Number</label>
  <input
    type="tel"
    name="phoneNumber"
    value={newAccount.phoneNumber}
    onChange={(e) => {
      const onlyDigits = e.target.value.replace(/\D/g, '');
      if (onlyDigits.length <= 11) {
        setNewAccount(prev => ({
          ...prev,
          phoneNumber: onlyDigits
        }));
      }
    }}
    className="w-full p-2 border rounded"
    required
    placeholder="09XXXXXXXXX"
  />
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

          {/* Change Email Modal */}
         {isChangeEmailModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-500">Change Email</h2>
        <button
          onClick={() => {
            setIsChangeEmailModalOpen(false);
            setEmailData({
              currentPassword: '',
              newEmail: '',
              confirmEmail: ''
            });
            setEmailVerified(null);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

                {/* Email Verification Status */}
                {checkingVerification ? (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Checking email verification status...</span>
                  </div>
                ) : emailVerified === false ? (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Email Not Verified</p>
                          <p>Please verify your current email address first.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRefreshVerification}
                        className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                        disabled={checkingVerification}
                      >
                        Refresh Status
                      </button>
                    </div>
                  </div>
                ) : emailVerified === true ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center">
                      <div className="h-4 w-4 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="text-sm text-green-800 font-medium">Email Verified ✓</span>
                    </div>
                  </div>
                ) : null}

                <form onSubmit={handleChangeEmail}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={emailData.currentPassword}
                      onChange={handleEmailInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">New Email</label>
                    <input
                      type="email"
                      name="newEmail"
                      value={emailData.newEmail}
                      onChange={handleEmailInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="Enter new email address"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Confirm New Email</label>
                    <input
                      type="email"
                      name="confirmEmail"
                      value={emailData.confirmEmail}
                      onChange={handleEmailInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="Confirm new email address"
                    />
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Email Change Process:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>First, verify your current email if required</li>
                          <li>Then submit your new email address</li>
                          <li>If verification fails, check your email and try again</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangeEmailModalOpen(false);
                        setEmailData({
                          currentPassword: '',
                          newEmail: '',
                          confirmEmail: ''
                        });
                        setEmailVerified(null);
                      }}
                      className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Disable Confirmation Modal */}
          {isDisableModalOpen && accountToDisable && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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