import { useState } from 'react';
import { CircleUser, X } from 'lucide-react';
import AdminLayout from './AdminLayout';

{/* Mama mo blue */}

function AccountManage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    role: 'customer',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const initialAccounts = [
    { name: 'Lance Ballicud', role: 'customer', email: 'ballicudlance@yahoo.com', dateCreated: '7/15/2025' },
    { name: 'Gabriel Lopez', role: 'kupal', email: 'tenz123@gmail.com', dateCreated: '7/18/2025' },
    { name: 'Basil Santiago', role: 'kupal', email: 'wtf123@gmail.com', dateCreated: '7/21/2025' },
    { name: 'Jerick Nucasa', role: 'customer', email: 'rassengan@gmail.com', dateCreated: '7/19/2025' },
  ];

  const [accounts, setAccounts] = useState(initialAccounts);

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionChange = (account, action) => {
    if (action === 'delete') {
      setAccounts(accounts.filter(acc => acc.email !== account.email));
    } else if (action === 'edit') {
      console.log(`Editing account: ${account.name}`);
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

  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    const newAccountWithDate = {
      ...newAccount,
      dateCreated: new Date().toLocaleDateString()
    };
    setAccounts([...accounts, newAccountWithDate]);
    setNewAccount({
      name: '',
      email: '',
      role: 'customer',
      password: ''
    });
    setIsAddAccountModalOpen(false);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    console.log('Password change submitted:', passwordData);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangePasswordModalOpen(false);
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
              onClick={() => setIsChangePasswordModalOpen(true)}
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
                <select className='p-1 border-1 rounded-lg'>
                    <option value="">Sort/Filter</option>
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
                  {filteredAccounts.map((account, index) => (
                    <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                      <td className="py-3 px-4">{account.name}</td>
                      <td className="py-3 px-4">{account.role}</td>
                      <td className="py-3 px-4">{account.email}</td>
                      <td className="py-3 px-4">{account.dateCreated}</td>
                      <td className="py-3 px-4">
                        <select 
                          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150"
                          onChange={(e) => handleActionChange(account, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled className='font-bold'>Action</option>
                          <option value="edit" className='font-bold'>Edit</option>
                          <option value="delete" className='font-bold'>Delete</option>
                        </select>
                      </td>
                    </tr>
                  ))}
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
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newAccount.name}
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
                      <option value="kupal">Kupal</option>
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
                
                <form onSubmit={handleChangePasswordSubmit}>
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
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AccountManage;