import React, { useEffect, useState } from 'react';
import {
    User,
    Mail,
    Phone,
    ShoppingBag,
    Star,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    CheckCircle,
    ChevronRight,
    ChevronLeft,
    Lock,
    LogOut,
    X,
    Loader2,
    Edit2,
    Save,
    Camera,
    CircleUser
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUser';
import { useOrder } from '../../hooks/useOrder';
import { doPasswordChange, doSignOut } from '../../firebase/auth';
import { toast } from 'sonner';
import ProductRatingModal from '../../components/ProductRatingModal';

const CustomerProfile = () => {
    const { currentUserData, editUser, loading: userLoading } = useUsers();
    const { userOrders, loading: ordersLoading, error: ordersError, updateOrderRatedStatus } = useOrder();
    const navigate = useNavigate();

    // Profile states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        image: ''
    });

    // Order history states
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [currentOrderItems, setCurrentOrderItems] = useState([]);
    const [currentRatingOrderId, setCurrentRatingOrderId] = useState(null);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Calculate pagination
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = userOrders ? userOrders.slice(indexOfFirstOrder, indexOfLastOrder) : [];
    const totalPages = userOrders ? Math.ceil(userOrders.length / itemsPerPage) : 0;

    // Initialize profile data when currentUserData changes
    useEffect(() => {
        if (currentUserData) {
            setProfileData({
                firstName: currentUserData.firstName || '',
                lastName: currentUserData.lastName || '',
                phone: currentUserData.phone || '',
                image: currentUserData.image
            });
        }
    }, [currentUserData]);

    // Reset to first page when total orders changes
    useEffect(() => {
        if (userOrders) {
            setCurrentPage(1);
        }
    }, [userOrders?.length]);

    const fullName = currentUserData
        ? `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim()
        : "User";

    const email = currentUserData?.email || "Not available";
    const phone = currentUserData?.phone || "Not available";

    // Profile handlers
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

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset to original data if canceling
            setProfileData({
                firstName: currentUserData.firstName || '',
                lastName: currentUserData.lastName || '',
                phone: currentUserData.phone || '',
                image: currentUserData.image
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
        } catch (error) {
            toast.error("Failed to update profile");
            console.error("Profile update error:", error);
        } finally {
            setEditLoading(false);
        }
    };

    // Order history handlers
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
            case 'paid':
                return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Paid</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Completed</span>;
            case 'cancelled':
                return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    const formatPrice = (price) => {
        return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    const needsRating = (order) => {
        return order.status === 'paid' && !order.isRated;
    };

    const handleRateOrder = (order) => {
        const orderItems = order.items.map(item => ({
            id: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price
        }));

        setCurrentOrderItems(orderItems);
        setCurrentRatingOrderId(order.id);
        setShowRatingModal(true);
    };

    const handleRatingSubmit = async (ratings) => {
        if (!currentRatingOrderId) return;

        try {
            setIsSubmittingRating(true);
            await updateOrderRatedStatus(currentRatingOrderId, true);
            toast.success('Thank you for rating your products!');
            setShowRatingModal(false);
            setCurrentRatingOrderId(null);
        } catch (error) {
            console.error("Error submitting ratings:", error);
            toast.error("Failed to submit ratings. Please try again.");
        } finally {
            setIsSubmittingRating(false);
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
            <div className="container mx-auto px-4 py-4 relative">
                {/* Back Button - Top Right */}
                <button className="absolute top-4 right-4 bg-[#ff6900] hover:bg-[#e55e00] text-white font-bold py-2 px-4 rounded-full flex items-center"
                    onClick={() => navigate('/customer/home')}
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Back
                </button>

                {/* Profile Section */}
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800 mt-16">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                {profileData.image ? (
                                    <img
                                        src={profileData.image}
                                        alt="Profile"
                                        className="rounded-full w-32 h-32 object-cover border-4 border-[#ff6900]"
                                    />
                                ) : (
                                    <CircleUser className="h-32 w-32 text-orange-600 bg-gray-200 rounded-full p-2" />
                                )}
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

                            {/* Account Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-6">
                                <button
                                    className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md border border-[#ff6900]"
                                    onClick={() => setIsChangePasswordModalOpen(true)}
                                >
                                    <Lock size={16} className="text-[#ff6900]" />
                                    <span>Change Password</span>
                                </button>

                                <button
                                    className="flex items-center justify-center gap-2 bg-[#ff6900] hover:bg-[#e55e00] text-white font-semibold py-2 px-4 rounded-md"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order History Section */}
                <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
                    <div className="flex items-center mb-6">
                        <ShoppingBag className="text-[#ff6900] mr-2" />
                        <h2 className="text-2xl font-bold text-[#ff6900] border-b border-gray-700 pb-2">My Orders</h2>
                    </div>

                    {ordersLoading && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading your orders...</p>
                        </div>
                    )}

                    {ordersError && (
                        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
                            {ordersError}
                        </div>
                    )}

                    {!ordersLoading && (!userOrders || userOrders.length === 0) && (
                        <div className="text-center py-8 bg-gray-800 rounded-lg">
                            <ShoppingBag className="mx-auto text-gray-500 mb-4" size={48} />
                            <h2 className="text-xl font-semibold text-gray-300 mb-2">No Orders Yet</h2>
                            <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                            <button
                                onClick={() => navigate('/customer/products')}
                                className="bg-[#ff6900] hover:bg-[#e55e00] text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    )}

                    {!ordersLoading && userOrders && userOrders.length > 0 && (
                        <>
                            <div className="space-y-4 mb-6">
                                {currentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-sm"
                                    >
                                        {/* Order header */}
                                        <div className="flex justify-between items-center p-4 bg-gray-700 border-b border-gray-600">
                                            <div>
                                                <div className="text-sm text-gray-300">Order #{order.id.slice(-6)}</div>
                                                <div className="text-sm text-gray-300">{order.createdAt}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(order.status)}
                                                {needsRating(order) && (
                                                    <button
                                                        onClick={() => handleRateOrder(order)}
                                                        disabled={isSubmittingRating && currentRatingOrderId === order.id}
                                                        className="flex items-center text-sm bg-orange-900 text-orange-100 px-3 py-1 rounded-full hover:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Star size={14} className="mr-1" />
                                                        Rate Items
                                                    </button>
                                                )}
                                                {order.isRated && (
                                                    <span className="flex items-center text-sm bg-green-900 text-green-100 px-3 py-1 rounded-full">
                                                        <CheckCircle size={14} className="mr-1" />
                                                        Rated
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order summary (always visible) */}
                                        <div className="p-4 flex justify-between items-center">
                                            <div>
                                                <div className="font-medium text-gray-200">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</div>
                                                <div className="text-sm text-gray-400">Payment: {order.paymentMethod}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-[#ff6900]">{formatPrice(order.totalAmount)}</div>
                                                <button
                                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                    className="text-[#ff6900] text-sm flex items-center hover:text-orange-400"
                                                >
                                                    {expandedOrder === order.id ? (
                                                        <>
                                                            <ChevronUp size={16} className="mr-1" />
                                                            Hide Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown size={16} className="mr-1" />
                                                            View Details
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded order details */}
                                        {expandedOrder === order.id && (
                                            <div className="border-t border-gray-700 p-4 bg-gray-750">
                                                <h3 className="font-medium mb-3 text-gray-200">Order Items</h3>
                                                <div className="space-y-3">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex items-center gap-3">
                                                            <img
                                                                src={item.image || "/images/logos/elmo.png"}
                                                                alt={item.name}
                                                                className="w-12 h-12 object-cover rounded-md border border-gray-600"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-200">{item.name}</div>
                                                                <div className="text-sm text-gray-400">
                                                                    Qty: {item.quantity} × {formatPrice(item.price)}
                                                                </div>
                                                            </div>
                                                            <div className="font-medium text-gray-200">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-700">
                                                    <div className="flex justify-between text-sm mb-1 text-gray-300">
                                                        <span>Subtotal:</span>
                                                        <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
                                                    </div>
                                                    {order.discount > 0 && (
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-300">Discount:</span>
                                                            <span className="text-red-400">-{formatPrice(order.discount)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between font-bold mt-2 text-gray-200">
                                                        <span>Total:</span>
                                                        <span className="text-[#ff6900]">{formatPrice(order.totalAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-8">
                                    <nav className="flex items-center space-x-1">
                                        <button
                                            onClick={prevPage}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-md ${currentPage === 1
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        {/* Generate page numbers */}
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            if (
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => paginate(pageNum)}
                                                        className={`px-3 py-2 rounded-md ${currentPage === pageNum
                                                            ? 'bg-[#ff6900] text-white font-medium'
                                                            : 'text-gray-300 hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                (pageNum === 2 && currentPage > 3) ||
                                                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                            ) {
                                                return <span key={pageNum} className="px-3 py-2 text-gray-500">...</span>;
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={nextPage}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-md ${currentPage === totalPages
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-300 hover:bg-gray-800'
                                                }`}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </nav>
                                </div>
                            )}

                            {/* Order count summary */}
                            <div className="text-center mt-2 text-sm text-gray-400">
                                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, userOrders.length)} of {userOrders.length} orders
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Change Password Modal */}
            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 text-white rounded-lg p-6 w-full max-w-md border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-[#ff6900]">Change Password</h2>
                            <button
                                onClick={() => setIsChangePasswordModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-[#ff6900] focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-[#ff6900] focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-300 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-[#ff6900] focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordModalOpen(false)}
                                    className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff6900] text-white rounded hover:bg-[#e55e00] flex items-center justify-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin h-5 w-5" />
                                    ) : "Save Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            <ProductRatingModal
                show={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false);
                    setCurrentRatingOrderId(null);
                }}
                cartItems={currentOrderItems}
                onSubmitRatings={handleRatingSubmit}
                isSubmitting={isSubmittingRating}
            />
        </div>
    );
};

export default CustomerProfile;