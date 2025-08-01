import { ArrowLeft, CreditCard, DiamondPlus, Minus, Plus, Search, ShoppingCart, Trash2, Clock } from "lucide-react"
import CartCard from "../../components/CartCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProduct";
import elmoLogo from '/images/logos/elmo.png'
import OrderDetailsModal from "../../components/OrderDetailsModal";
import { useState, useEffect } from "react";
import ProductDetailsModal from "../../components/ProductsDetailsModal";
import { toast } from "sonner";
import { useOrder } from "../../hooks/useOrder";

const Cart = () => {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
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

        if (currentOrder && currentOrder.status === 'paid') {
            // Order has been paid, notify the user to view/rate from Order History
            setCurrentOrderId(null); // Reset to prevent multiple triggers

            toast.success('Your order has been confirmed!', {
                action: {
                    label: 'View Order',
                    onClick: () => navigate('/customer/orders')
                },
                description: 'You can view details and rate products in My Orders'
            });
        }
    }, [userOrders, currentOrderId, navigate]);

    // Handle checkout completion
    const handleCheckoutComplete = (orderId) => {
        setOrderCompleted(true);
        setShowOrderModal(false);

        // Store the order ID to monitor its status
        setCurrentOrderId(orderId);

        // Show success message
        // toast.success('Order placed successfully! We will notify you when payment is confirmed.');

        // Also inform the user they can view their orders
        toast.info('You can view your order history in "My Orders"', {
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

            {/* Add More Products Section */}
            <div className="w-full max-w-screen-lg bg-[#2E2E2E] rounded-xl flex flex-col">
                <div className="w-full h-auto rounded-t-xl flex flex-col sm:flex-row items-center justify-between px-3 py-4">
                    <div className="flex flex-row items-center mb-4 sm:mb-0">
                        <DiamondPlus className="text-white" />
                        <label className="text-white font-bold text-lg sm:text-xl ml-3">Add more product?</label>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="text-white" size={18} />
                        </span>
                        <input
                            className="w-full h-8 bg-[#444444] rounded-full pl-10 text-white placeholder-white"
                            placeholder="Search..."
                            type="text"
                            onChange={(e) => setSearchFilter(e.target.value)}
                            value={searchFilter}
                        />
                    </div>
                </div>
                <div className="w-full px-3 flex flex-wrap gap-4 justify-center mb-2">
                    {filteredProducts.slice(0, 9).map((product, idx) => (
                        <div key={idx} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                            <CartCard
                                productDetails={product}
                                title={product.name}
                                handleShowDetailsModal={handleShowDetailsModal}
                                productId={product.id}
                                description1={product.spec1}
                                rating={product.rating}
                                image={product.image ? product.image : elmoLogo}
                                addToCart={addToCart}
                            />
                        </div>
                    ))}
                </div>
                <div className="w-full h-16 bg-[#2E2E2E] rounded-b-xl flex items-center justify-center">
                    <button
                        className="w-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors"
                        style={{ borderRadius: "10px" }}
                        onClick={() => navigate("/customer/products")}
                    >
                        Show More
                    </button>
                </div>
            </div>

            {/* Modals */}
            <OrderDetailsModal
                show={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                onComplete={handleCheckoutComplete}
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