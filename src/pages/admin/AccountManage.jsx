import { useNavigate } from 'react-router-dom';
import { CircleUser } from 'lucide-react';
import Sidebar from '../../components/Sidebar'
import { useState } from 'react';

function AccountManage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const initialAccounts = [
    { name: 'Lance Ballicud', role: 'customer', email: 'ballicudlance@yahoo.com', dateCreated: '7/15/2025' },
    { name: 'Gabriel Lopez', role: 'kupal', email: 'tenz123@gmail.com', dateCreated: '7/18/2025' },
    { name: 'Basil Santiago', role: 'kupal', email: 'wtf123@gmail.com', dateCreated: '7/21/2025' },
    { name: 'Jerick Nucasa', role: 'customer', email: 'rassengan@gmail.com', dateCreated: '7/19/2025' },
  ];

  const filteredAccounts = initialAccounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionChange = (account, action) => {
    if (action === 'delete') {
      console.log(`Deleting account: ${account.name}`);
    } else if (action === 'edit') {
      console.log(`Editing account: ${account.name}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - fixed width */}
        <Sidebar userType='admin' />
      {/* Main content - offset by sidebar width */}
      <div className="flex-1  p-4">
        {/* Header */}
        <div className="bg-orange-500 w-full py-4 px-6">
          <h1 className="text-white text-3xl font-bold">Admin Profile</h1>
        </div>
        
        <div className="flex items-center justify-between w-full mx-auto mt-8 bg-white shadow-md p-6 rounded-lg mb-10">
          <div className="flex items-center space-x-6">
            <CircleUser className="h-20 w-20 text-purple-800 bg-gray-200 rounded-full p-2" />
            <div>
              <h2 className="text-2xl font-semibold text-black">ADMIN</h2>
              <p className="text-gray-600">Email Address: admin@elmo.com</p>
              <button
                onClick={() => navigate('/add-account')}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                Add Account
              </button>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/change-password')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
            Change Password
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg w-full p-4">
          <h1 className="text-orange-500 text-bold text-2xl mb-4">Account Management</h1>
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
                <tr className="bg-gray-100 text-left">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Date Created</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{account.name}</td>
                    <td className="py-3 px-4">{account.role}</td>
                    <td className="py-3 px-4">{account.email}</td>
                    <td className="py-3 px-4">{account.dateCreated}</td>
                    <td className="py-3 px-4">
                      <select 
                        className="border rounded p-1 bg-green-600 text-white font-bold"
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
      </div>
      
      
    </div>
  );
}

export default AccountManage;