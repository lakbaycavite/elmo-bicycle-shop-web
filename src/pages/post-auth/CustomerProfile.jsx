import React, { useState } from 'react';
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

const CustomerProfile = () => {
    // Dummy user data
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street, Apt 4B, New York, NY 10001",
        profileImage: "https://randomuser.me/api/portraits/men/44.jpg"
    };

    // Dummy transaction data
    const allTransactions = [
        { id: 1, date: "2025-07-18", description: "Online Purchase - Electronics", amount: "$149.99", status: "Completed" },
        { id: 2, date: "2025-07-15", description: "Monthly Subscription", amount: "$12.99", status: "Completed" },
        { id: 3, date: "2025-07-10", description: "Grocery Store", amount: "$87.65", status: "Completed" },
        { id: 4, date: "2025-07-05", description: "Restaurant Payment", amount: "$42.75", status: "Completed" },
        { id: 5, date: "2025-06-30", description: "Utility Bill", amount: "$120.50", status: "Completed" },
        { id: 6, date: "2025-06-25", description: "Gas Station", amount: "$45.00", status: "Completed" },
        { id: 7, date: "2025-06-20", description: "Online Shopping", amount: "$78.32", status: "Completed" },
        { id: 8, date: "2025-06-15", description: "Coffee Shop", amount: "$8.75", status: "Completed" },
        { id: 9, date: "2025-06-10", description: "Mobile Phone Bill", amount: "$60.00", status: "Completed" },
        { id: 10, date: "2025-06-05", description: "Streaming Service", amount: "$14.99", status: "Completed" },
        { id: 11, date: "2025-05-30", description: "Department Store", amount: "$125.45", status: "Completed" },
        { id: 12, date: "2025-05-25", description: "Internet Service", amount: "$65.00", status: "Completed" },
        { id: 13, date: "2025-05-20", description: "Pharmacy Purchase", amount: "$32.99", status: "Completed" },
        { id: 14, date: "2025-05-15", description: "Book Store", amount: "$24.99", status: "Completed" },
        { id: 15, date: "2025-05-10", description: "Gym Membership", amount: "$50.00", status: "Completed" },
        { id: 16, date: "2025-05-05", description: "Clothing Store", amount: "$95.80", status: "Completed" },
        { id: 17, date: "2025-04-30", description: "Home Improvement", amount: "$210.45", status: "Completed" },
        { id: 18, date: "2025-04-25", description: "Pet Supplies", amount: "$67.50", status: "Completed" },
        { id: 19, date: "2025-04-20", description: "Electronics Store", amount: "$299.99", status: "Completed" },
        { id: 20, date: "2025-04-15", description: "Furniture Purchase", amount: "$450.00", status: "Completed" },
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get current transactions
    const indexOfLastTransaction = currentPage * itemsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
    const currentTransactions = allTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);

    // Calculate total pages
    const totalPages = Math.ceil(allTransactions.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);


    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-black to-[#ff6900] bg-no-repeat bg-fixed" style={{ background: "linear-gradient(135deg, black 80%, #ff6900 100%)" }}>
            {/* Back Button - Top Right */}
            <div className="container mx-auto px-4 py-4 relative">
                <button className="absolute top-4 right-4 bg-[#ff6900] hover:bg-[#e55e00] text-white font-bold py-2 px-4 rounded-full flex items-center">
                    <ArrowLeft size={18} className="mr-1" />
                    Back
                </button>

                {/* User and Datetime Info */}
                <div className="text-white text-sm mb-6 mt-16">

                </div>

                {/* Top section with profile image and account details */}
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                            <img
                                src={user.profileImage}
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
                                        <span className="ml-2 text-white">{user.name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Email:</span>
                                        <span className="ml-2 text-white">{user.email}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Phone:</span>
                                        <span className="ml-2 text-white">{user.phone}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Address:</span>
                                        <span className="ml-2 text-white">{user.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
                    <h2 className="text-2xl font-bold mb-4 text-[#ff6900] border-b border-gray-700 pb-2 flex items-center">
                        <FileText className="text-[#ff6900] mr-2" size={24} />
                        Transaction History
                    </h2>

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
                                            Description
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
                                        <td className="py-3 px-4">{transaction.date}</td>
                                        <td className="py-3 px-4">{transaction.description}</td>
                                        <td className="py-3 px-4 font-medium">{transaction.amount}</td>
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