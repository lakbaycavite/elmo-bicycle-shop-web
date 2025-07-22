import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

function UserManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const initialAccounts = [
    { name: 'Angelo Martinez', role: 'CUSTOMER', email: 'gelomartineze@yahoo.com' },
    { name: 'Gabriel Lopez', role: 'KUPAL', email: 'tenz123@gmail.com' },
    { name: 'Alfonso Mabale', role: 'KUPAL', email: 'abby123@gmail.com' },
    { name: 'Raymundo Pallera', role: 'KUPAL', email: 'rassengan@gmail.com' },
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
              <select className='p-1 border-1 rounded-lg'>
                  <option value="">All Roles</option>
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
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => (
                  <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                    <td className="py-3 px-4">{account.name}</td>
                    <td className="py-3 px-4">{account.role}</td>
                    <td className="py-3 px-4">{account.email}</td>
                    <td className="py-3 px-4">
                      <select 
                         className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150"
                        onChange={(e) => handleActionChange(account, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled className='font-bold'>Active</option>
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
    </AdminLayout>
  );
}

export default UserManagement;