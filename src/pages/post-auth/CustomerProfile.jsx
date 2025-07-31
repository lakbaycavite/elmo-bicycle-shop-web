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
    ArrowLeft,
    X,
    Loader2,
    Edit2,
    Save,
    Camera,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUser';
import { useOrder } from '../../hooks/useOrder';
import { doPasswordChange, doSignOut } from '../../firebase/auth';
import { toast } from 'sonner';

const CustomerProfile = () => {
    const { currentUserData, editUser, loading: userLoading } = useUsers();
    const navigate = useNavigate();
    const { userOrders, loadUserOrders } = useOrder();

    useEffect(() => {
        loadUserOrders();
    }, [loadUserOrders]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    // Edit profile states
    const [isEditing, setIsEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        image: ''
    });

    // Initialize profile data when currentUserData changes
    useEffect(() => {
        if (currentUserData) {
            setProfileData({
                firstName: currentUserData.firstName || '',
                lastName: currentUserData.lastName || '',
                phone: currentUserData.phone || '',
                image: currentUserData.image || "https://randomuser.me/api/portraits/men/44.jpg"
            });
        }
    }, [currentUserData]);

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

    const handleLogout = async () => {
        await doSignOut()
            .then(() => {
                toast.success("Logout successful");
            })
            .catch((error) => {
                toast.error("Logout failed");
                console.error("Logout failed", error);
            });
        navigate('/');
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangePasswordModalOpen(true);
        setLoading(true);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirm password do not match.");
            setLoading(false);
            return;
        } else {
            await doPasswordChange(passwordData.currentPassword, passwordData.newPassword)
                .then(() => {
                    toast.success("Password changed successfully");
                    setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                    setIsChangePasswordModalOpen(false);
                })
                .catch(() => {
                    toast.error("New password and confirm password do not match or wrong current password");
                })
                .finally(() => {
                    setLoading(false);
                    setIsChangePasswordModalOpen(false);
                })
        }
    };

    // Edit profile handlers
    const handleEditToggle = () => {
        if (isEditing) {
            // Reset to original data if canceling
            setProfileData({
                firstName: currentUserData.firstName || '',
                lastName: currentUserData.lastName || '',
                phone: currentUserData.phone || '',
                image: currentUserData.image || "https://randomuser.me/api/portraits/men/44.jpg"
            });
        }
        setIsEditing(!isEditing);
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // For demo purposes, we'll use a file reader to convert to base64
            // In a real app, you'd upload to a service like Firebase Storage
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({
                    ...prev,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUserData?.id) {
            toast.error("User ID not found");
            return;
        }

        setEditLoading(true);
        try {
            await editUser(currentUserData.id, {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone,
                image: profileData.image
            });

            setIsEditing(false);
            // toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
            console.error("Profile update error:", error);
        } finally {
            setEditLoading(false);
        }
    };

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
                            <div className="relative">
                                <img
                                    src={profileData.image}
                                    alt="Profile"
                                    className="rounded-full w-32 h-32 object-cover border-4 border-[#ff6900]"
                                />
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 bg-[#ff6900] hover:bg-[#e55e00] rounded-full p-2 cursor-pointer">
                                        <Camera size={16} className="text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-[#ff6900] border-b border-gray-700 pb-2">Account Details</h2>
                                <div className="flex gap-2">
                                    {!isEditing ? (
                                        <button
                                            onClick={handleEditToggle}
                                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md border border-[#ff6900]"
                                        >
                                            <Edit2 size={16} className="text-[#ff6900]" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={editLoading}
                                                className="flex items-center gap-2 bg-[#ff6900] hover:bg-[#e55e00] text-white px-3 py-2 rounded-md disabled:opacity-50"
                                            >
                                                {editLoading ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Save size={16} />
                                                )}
                                                Save
                                            </button>
                                            <button
                                                onClick={handleEditToggle}
                                                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-md"
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <User className="text-[#ff6900]" size={20} />
                                    <div className="flex-1">
                                        <span className="text-gray-400 font-medium">Name:</span>
                                        {isEditing ? (
                                            <div className="flex gap-2 mt-2">
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={profileData.firstName}
                                                    onChange={handleProfileInputChange}
                                                    placeholder="First Name"
                                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-[#ff6900] focus:outline-none flex-1"
                                                />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={profileData.lastName}
                                                    onChange={handleProfileInputChange}
                                                    placeholder="Last Name"
                                                    className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-[#ff6900] focus:outline-none flex-1"
                                                />
                                            </div>
                                        ) : (
                                            <span className="ml-2 text-white">{fullName}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Mail className="text-[#ff6900]" size={20} />
                                    <div>
                                        <span className="text-gray-400 font-medium">Email:</span>
                                        <span className="ml-2 text-white">{email}</span>
                                        {isEditing && (
                                            <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="text-[#ff6900]" size={20} />
                                    <div className="flex-1">
                                        <span className="text-gray-400 font-medium">Phone:</span>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileInputChange}
                                                placeholder="Phone Number"
                                                className="ml-2 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600 focus:border-[#ff6900] focus:outline-none"
                                            />
                                        ) : (
                                            <span className="ml-2 text-white">{phone}</span>
                                        )}
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
                                                <td className="py-3 px-4 font-medium">{`₱${transaction.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</td>
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
                    <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-md border border-[#ff6900]"
                        onClick={
                            () => setIsChangePasswordModalOpen(true)
                        }>
                        <Lock size={18} className="text-[#ff6900]" />
                        <span>Change Password</span>
                    </button>

                    <button className="flex items-center justify-center gap-2 bg-[#ff6900] hover:bg-[#e55e00] text-white font-semibold py-3 px-6 rounded-md" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className='animate-spin' />
                                        </>
                                    ) : "Save Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;