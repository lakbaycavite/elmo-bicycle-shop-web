import { useState } from 'react';
import AdminLayout from './AdminLayout';

function UserActivity() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const initialAccounts = [
    { name: 'Lance Ballicud', role: 'customer', email: 'ballicudlance@yahoo.com', status: 'Active' },
    { name: 'Gabriel Lopez', role: 'kupal', email: 'tenz123@gmail.com', status: 'Active' },
    { name: 'Basil Santiago', role: 'kupal', email: 'wtf123@gmail.com', status: 'Inactive' },
    { name: 'Jerick Nucasa', role: 'customer', email: 'rassengan@gmail.com', status: 'Active' },
    { name: 'John Doe', role: 'customer', email: 'helloworld@gmail.com', status: 'Active' },
    { name: 'Djion', role: 'customer', email: 'apple123@gmail.com', status: 'Inactive' },
    { name: 'Bugoy Mo si Koykoy', role: 'customer', email: 'hey231@gmail.com', status: 'Active' },
    { name: 'Raymundo Pallera', role: 'customer', email: 'ggwp69@gmail.com', status: 'Active' },
  ];

  const [accounts] = useState(initialAccounts);


   const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole ? account.role === selectedRole : true;
    return matchesSearch && matchesRole;
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AdminLayout>
      <div className="flex min-h-screen bg-white">
        <div className="flex-1 p-4">   
          <div className="bg-white shadow-xl rounded-lg w-full p-4">
            <label className="text-orange-500 text-bold text-2xl mb-4">
            <h1 >USERS</h1>
            </label>
            <div className='flex flex-row gap-4 mb-6'>
              <input 
                type='text'
                placeholder='Search...'
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
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="kupal">Kupal</option>
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
                  {currentItems.map((account, index) => (
                    <tr key={index} className="bg-gray-800 text-white border-b border-gray-700">
                      <td className="py-3 px-4">{account.name}</td>
                      <td className="py-3 px-4">{account.role}</td>
                      <td className="py-3 px-4">{account.email}</td>
                      <td className={`py-3 px-4 ${
                        account.status === 'Active' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {account.status}
                      </td>
                    </tr>
                  ))}
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
                      className={`px-3 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium ${
                        currentPage === number 
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