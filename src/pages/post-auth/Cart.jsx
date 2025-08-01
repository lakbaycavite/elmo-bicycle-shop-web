import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, DiamondPlus, Minus, Plus, RefreshCw, Search, ShoppingCart, Trash2, Clock } from "lucide-react"
import CartCard from "../../components/CartCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProduct";
import elmoLogo from '/images/logos/elmo.png'
import OrderDetailsModal from "../../components/OrderDetailsModal";
import ProductRatingModal from "../../components/ProductRatingModal";
import { useState, useEffect } from "react";
import ProductDetailsModal from "../../components/ProductsDetailsModal";
import { toast } from "sonner";
import { useOrder } from "../../hooks/useOrder";

const Cart = () => {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [completedCartItems, setCompletedCartItems] = useState([]);
    const [viewProduct, setViewProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");

    // New states for order status monitoring
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [orderStatusCheckInterval, setOrderStatusCheckInterval] = useState(null);

    const { cart, updateQuantity, removeItem, totalPrice, totalDiscount, addToCart, clearCart } = useCart();
    const { products, getProduct } = useProducts();
    const { subscribeToOrder, userOrders } = useOrder();

    const navigate = useNavigate();

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.category.toLowerCase().includes(searchFilter.toLowerCase())
    );

    // Monitor order status changes using real-time listener
    useEffect(() => {
        if (!currentOrderId) return;

        const unsubscribe = subscribeToOrder(currentOrderId);

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentOrderId, subscribeToOrder]);

    // Monitor userOrders for status changes of the current order
    useEffect(() => {
        if (!currentOrderId || !userOrders.length) return;

        const currentOrder = userOrders.find(order => order.id === currentOrderId);

        if (currentOrder && currentOrder.status === 'paid' && !showRatingModal) {
            // Order has been paid, show rating modal
            setShowRatingModal(true);
            setCurrentOrderId(null); // Reset to prevent multiple triggers

            toast.success('Your order has been confirmed! Please rate your products.');
        }
    }, [userOrders, currentOrderId, showRatingModal]);

    // Handle checkout completion - modified to not show rating modal immediately
    const handleCheckoutComplete = (orderId) => {
        setCompletedCartItems([...cart]);
        setShowOrderModal(false);
        setOrderCompleted(true);

        // Store the order ID to monitor its status
        setCurrentOrderId(orderId);

        // Show success message
        toast.success('Order placed successfully! You can rate your products once payment is confirmed.');

        // Also inform the user they can view their orders
        toast.info('You can view your order history and rate your products anytime from "My Orders"', {
            duration: 6000,
            action: {
                label: 'View Orders',
                onClick: () => navigate('/customer/orders')
            }
        });
    };

    const handleShowDetailsModal = async (product) => {
        if (!product) {
            console.error("No product data provided for details modal");
            return;
        }
        await getProduct(product.id)
            .then(() => {
                setViewProduct(product);
                setShowDetailsModal(true);
            })
            .catch((error) => {
                console.error("Error fetching product details:", error);
                toast.error(`Failed to load product details`);
            });
    }

    // Handle rating submission
    const handleRatingSubmit = async (ratings) => {
        try {
            // After successful submission, redirect to order history
            clearCart();
            navigate("/customer/orders");
        } catch (error) {
            console.error("Error submitting ratings:", error);
        }
    };

    const handleUpdateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return; // Prevent negative quantities
        await updateQuantity(id, newQuantity);
    };

    // Format price to Philippine Peso
    const formatPrice = (price) => {
        return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (orderStatusCheckInterval) {
                clearInterval(orderStatusCheckInterval);
            }
        };
    }, [orderStatusCheckInterval]);

    return (
        <div className="w-full h-full flex flex-col space-y-4 items-center justify-center p-4 bg-gray-950">
            <div className="w-full max-w-screen-lg bg-gray-50 rounded-xl flex flex-col relative">
                {/* Header */}
                <div className="w-full h-16 bg-[#2E2E2E] flex items-center justify-between rounded-t-xl px-6 top-0 z-10">
                    <div className="flex items-center">
                        <ShoppingCart className="text-white h-5 w-5" />
                        <label className="text-orange-500 font-bold text-lg ml-3">SHOPPING CART</label>
                    </div>
                    <button
                        onClick={() => navigate('/customer/orders')}
                        className="flex items-center text-white hover:text-orange-300 transition-colors"
                    >
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">My Orders</span>
                    </button>
                </div>

                {/* Scrollable Product List */}
                <div className="flex-1 overflow-auto px-4 sm:px-6">
                    <table className="table-auto w-full">
                        <thead className="sticky top-0 bg-white z-10">
                            <tr className="border-b border-gray-200">
                                <th scope="col" className="py-4 text-left w-24">Remove</th>
                                <th scope="col" className="py-4 text-left">Product Details</th>
                                <th scope="col" className="py-4 text-center w-1/6">Quantity</th>
                                <th scope="col" className="py-4 text-right w-1/6">Price</th>
                                <th scope="col" className="py-4 text-right w-1/6">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {cart.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-5">
                                        <button
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={item.image ? item.image : elmoLogo}
                                                className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg"
                                                alt={item.name}
                                            />
                                            <div>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-gray-500 text-sm sm:text-base">Category: {item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center justify-center">
                                            <button
                                                className="p-1 rounded-l bg-gray-100 border border-gray-300 hover:bg-gray-200"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus size={16} className="text-gray-600" />
                                            </button>
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                className="w-12 h-8 text-center border-y border-gray-300 outline-none"
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) handleUpdateQuantity(item.id, val);
                                                }}
                                            />
                                            <button
                                                className="p-1 rounded-r bg-gray-100 border border-gray-300 hover:bg-gray-200"
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus size={16} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-5 text-right font-medium">
                                        {
                                            Number(item.discount) > 0
                                                ? formatPrice(Number(item.discountedFinalPrice))
                                                : formatPrice(item.price)
                                        }
                                    </td>
                                    <td className="py-5 text-right font-medium">
                                        {
                                            Number(item.discount) > 0
                                                ? formatPrice(Number(item.discountedFinalPrice) * item.quantity)
                                                : formatPrice(item.price * item.quantity)
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Fixed Order Summary */}
                <div className="w-full border-t border-gray-200 bg-white p-5 rounded-b-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <button className="flex items-center text-gray-600 hover:text-orange-500 mb-4 sm:mb-0" onClick={() => navigate("/")}>
                            <ArrowLeft size={16} className="mr-1" />
                            <span>Continue Shopping</span>
                        </button>

                        <div className="w-full sm:w-80 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Discount: </span>
                                <span className="text-red-500">{formatPrice(totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-bold text-lg">Grand Total:</span>
                                <span className="font-bold text-lg">{formatPrice(totalPrice)}</span>
                            </div>

                            <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                                onClick={() => setShowOrderModal(true)}
                            >
                                <CreditCard size={18} className="mr-2" />
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of component remains the same */}
            {/* ... */}

            {/* Modals */}
            <OrderDetailsModal
                show={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                onComplete={handleCheckoutComplete}
            />
            <ProductRatingModal
                show={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                cartItems={orderCompleted ? completedCartItems : []}
                onSubmitRatings={handleRatingSubmit}
            />
            <ProductDetailsModal
                viewProduct={viewProduct}
                showDetailsModal={showDetailsModal}
                setShowDetailsModal={setShowDetailsModal}
                formatPrice={(price) => `₱${new Intl.NumberFormat().format(price)}`}
            />
        </div>
    );
}

export default Cart