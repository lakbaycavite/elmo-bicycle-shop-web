import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { ShoppingBag, Star, ChevronDown, ChevronUp, ArrowLeft, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import ProductRatingModal from '../components/ProductRatingModal';

const OrderHistory = () => {
    const { userOrders, loading, error, updateOrderRatedStatus } = useOrder();
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [currentOrderItems, setCurrentOrderItems] = useState([]);
    const [currentRatingOrderId, setCurrentRatingOrderId] = useState(null);
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const navigate = useNavigate();

    // Calculate pagination
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = userOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(userOrders.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Format order status
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

    // Format price
    const formatPrice = (price) => {
        return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    // Check if an order needs rating
    const needsRating = (order) => {
        return order.status === 'paid' && !order.isRated;
    };

    // Handle opening the rating modal for a specific order
    const handleRateOrder = (order) => {
        // Transform order items to format expected by ProductRatingModal
        const orderItems = order.items.map(item => ({
            id: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price
        }));

        setCurrentOrderItems(orderItems);
        setCurrentRatingOrderId(order.id); // Store the order ID we're rating
        setShowRatingModal(true);
    };

    // Handle rating submission
    const handleRatingSubmit = async (ratings) => {
        if (!currentRatingOrderId) return;

        try {
            setIsSubmittingRating(true);

            // Call the API to update the order's rated status
            await updateOrderRatedStatus(currentRatingOrderId, true);

            toast.success('Thank you for rating your products!');

            // Close the modal and reset state
            setShowRatingModal(false);
            setCurrentRatingOrderId(null);

        } catch (error) {
            console.error("Error submitting ratings:", error);
            toast.error("Failed to submit ratings. Please try again.");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    // Reset to first page when total orders changes
    useEffect(() => {
        setCurrentPage(1);
    }, [userOrders.length]);

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-600 hover:text-orange-500"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        <span>Back to Home</span>
                    </button>
                </div>

                <div className="flex items-center mb-6">
                    <ShoppingBag className="text-orange-500 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your orders...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {!loading && userOrders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate('/customer/products')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {!loading && userOrders.length > 0 && (
                    <>
                        <div className="space-y-4 mb-6">
                            {currentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                                >
                                    {/* Order header */}
                                    <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
                                        <div>
                                            <div className="text-sm text-gray-500">Order #{order.id.slice(-6)}</div>
                                            <div className="text-sm text-gray-500">{order.createdAt}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(order.status)}
                                            {needsRating(order) && (
                                                <button
                                                    onClick={() => handleRateOrder(order)}
                                                    disabled={isSubmittingRating && currentRatingOrderId === order.id}
                                                    className="flex items-center text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Star size={14} className="mr-1" />
                                                    Rate Items
                                                </button>
                                            )}
                                            {order.isRated && (
                                                <span className="flex items-center text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                    <CheckCircle size={14} className="mr-1" />
                                                    Rated
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order summary (always visible) */}
                                    <div className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</div>
                                            <div className="text-sm text-gray-500">Payment: {order.paymentMethod}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg text-orange-500">{formatPrice(order.totalAmount)}</div>
                                            <button
                                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                                className="text-blue-500 text-sm flex items-center hover:text-blue-700"
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
                                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <h3 className="font-medium mb-3">Order Items</h3>
                                            <div className="space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <img
                                                            src={item.image || "/images/logos/elmo.png"}
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded-md border border-gray-200"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium">{item.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                Qty: {item.quantity} × {formatPrice(item.price)}
                                                            </div>
                                                        </div>
                                                        <div className="font-medium">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Subtotal:</span>
                                                    <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
                                                </div>
                                                {order.discount > 0 && (
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Discount:</span>
                                                        <span className="text-red-500">-{formatPrice(order.discount)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-bold mt-2">
                                                    <span>Total:</span>
                                                    <span>{formatPrice(order.totalAmount)}</span>
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
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {/* Generate page numbers */}
                                    {[...Array(totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        // Show first page, last page, current page, and one page before and after current
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
                                                        ? 'bg-orange-500 text-white font-medium'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            (pageNum === 2 && currentPage > 3) ||
                                            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                        ) {
                                            // Show ellipsis for skipped pages
                                            return <span key={pageNum} className="px-3 py-2">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-2 rounded-md ${currentPage === totalPages
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </nav>
                            </div>
                        )}

                        {/* Order count summary */}
                        <div className="text-center mt-2 text-sm text-gray-500">
                            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, userOrders.length)} of {userOrders.length} orders
                        </div>
                    </>
                )}
            </div>

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
        </>
    );
};

export default OrderHistory;