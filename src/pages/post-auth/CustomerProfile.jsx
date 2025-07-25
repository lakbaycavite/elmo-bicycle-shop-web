import React, { useEffect, useState } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    FileText,
    Clock,
    Lock,
    LogOut,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUser';
import { useOrder } from '../../hooks/useOrder';

const CustomerProfile = () => {
    const { currentUserData } = useUsers();
    const navigate = useNavigate();
    const { userOrders, loadUserOrders } = useOrder();

    useEffect(() => {
        loadUserOrders();
    }, [loadUserOrders]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastTransaction = currentPage * itemsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
    const currentTransactions = userOrders.slice(indexOfFirstTransaction, indexOfLastTransaction);

    const totalPages = Math.ceil(userOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const fullName = currentUserData ?
        `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() :
        "User";

    const email = currentUserData?.email || "Not available";
    const phone = currentUserData?.phone || "Not available";

    if (!currentUserData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-black to-[#ff6900] bg-no-repeat bg-fixed flex items-center justify-center">
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-[#ff6900]">Loading Profile...</h2>
                    <p>Please wait while we retrieve your information.</p>
                    <button
                        className="mt-4 bg-[#ff6900] hover:bg-[#e55e00] text-white font-bold py-2 px-4 rounded-full flex items-center"
                        onClick={() => navigate('/customer/home')}
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-black to-[#ff6900] bg-no-repeat bg-fixed" style={{ background: "linear-gradient(135deg, black 80%, #ff6900 100%)" }}>
            {/* Back Button - Top Right */}
            <div className="container mx-auto px-4 py-4 relative">
                <button className="absolute top-4 right-4 bg-[#ff6900] hover:bg-[#e55e00] text-white font-bold py-2 px-4 rounded-full flex items-center"
                    onClick={() => navigate('/customer/home')}
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Back
                </button>

                {/* Top section with profile image and account details */}
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800 mt-16">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                            <img
                                src={"https://randomuser.me/api/portraits/men/44.jpg"}
                                alt="Profile"
                                className="rounded-full w-32 h-32 object-cover border-4 border-[#ff6900]"
                            />
                        </div>

                        {/* Account Details */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-4 text-[#ff6900] border-b border-gray-700 pb-2">Account Details</h2>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Name:</span>
                                        <span className="ml-2 text-white">{fullName}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Email:</span>
                                        <span className="ml-2 text-white">{email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Phone:</span>
                                        <span className="ml-2 text-white">{phone}</span>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-4 text-[#ff6900] border-b border-gray-700 pb-2 flex items-center">
                        <FileText className="text-[#ff6900] mr-2" size={24} />
                        Transaction History
                    </h2>

                    {/* Format date helper function */}
                    {(() => {
                        const formatDate = (dateString) => {
                            if (!dateString) return "N/A";
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return dateString;
                            return date.toLocaleString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            });
                        };

                        return (
                            <div className="overflow-x-auto">
                                <table className="table-auto w-full">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th scope="col" className="py-3 px-4 text-left text-[#ff6900]">#</th>
                                            <th scope="col" className="py-3 px-4 text-left text-[#ff6900]">
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="mr-1" />
                                                    Date
                                                </div>
                                            </th>
                                            <th scope="col" className="py-3 px-4 text-left text-[#ff6900]">
                                                <div className="flex items-center">
                                                    <FileText size={16} className="mr-1" />
                                                    Payment Method
                                                </div>
                                            </th>
                                            <th scope="col" className="py-3 px-4 text-left text-[#ff6900]">
                                                <div className="flex items-center">
                                                    <DollarSign size={16} className="mr-1" />
                                                    Amount
                                                </div>
                                            </th>
                                            <th scope="col" className="py-3 px-4 text-left text-[#ff6900]">
                                                <div className="flex items-center">
                                                    <Clock size={16} className="mr-1" />
                                                    Status
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800">
                                                <td className="py-3 px-4">{transaction.id}</td>
                                                <td className="py-3 px-4">{formatDate(transaction.createdAt)}</td>
                                                <td className="py-3 px-4">{transaction.paymentMethod}</td>
                                                <td className="py-3 px-4 font-medium">{transaction.totalAmount}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })()}

                    {/* Pagination */}
                    <nav className="mt-6 flex justify-center">
                        <ul className="flex space-x-2">
                            <li>
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === 1
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <li key={number}>
                                    <button
                                        onClick={() => paginate(number)}
                                        className={`px-3 py-1 rounded ${currentPage === number
                                            ? 'bg-[#ff6900] text-white'
                                            : 'bg-gray-700 text-white hover:bg-gray-600'
                                            }`}
                                    >
                                        {number}
                                    </button>
                                </li>
                            ))}

                            <li>
                                <button
                                    className={`px-3 py-1 rounded ${currentPage === totalPages
                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 justify-center pb-10">
                    <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md border border-[#ff6900]">
                        <Lock size={18} className="text-[#ff6900]" />
                        <span>Change Password</span>
                    </button>

                    <button className="flex items-center justify-center gap-2 bg-[#ff6900] hover:bg-[#e55e00] text-white font-semibold py-3 px-6 rounded-md">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;