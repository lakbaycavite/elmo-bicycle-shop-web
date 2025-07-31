import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, DiamondPlus, Minus, Plus, RefreshCw, Search, ShoppingCart, Trash2 } from "lucide-react"
import CartCard from "../../components/CartCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProduct";
import elmoLogo from '/images/logos/elmo.png'
import OrderDetailsModal from "../../components/OrderDetailsModal";
import ProductRatingModal from "../../components/ProductRatingModal";
import { useState } from "react";
import ProductDetailsModal from "../../components/ProductsDetailsModal";
import { toast } from "sonner";
// import { useDiscount } from "../../hooks/useDiscount";

const Cart = () => {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [completedCartItems, setCompletedCartItems] = useState([]);
    const [viewProduct, setViewProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");

    const { cart, updateQuantity, removeItem, totalPrice, totalDiscount, addToCart, clearCart } = useCart();
    const { products, getProduct } = useProducts();

    const navigate = useNavigate();


    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        product.category.toLowerCase().includes(searchFilter.toLowerCase())
    );

    // Handle checkout completion
    const handleCheckoutComplete = () => {
        setCompletedCartItems([...cart]);
        setShowOrderModal(false);
        setOrderCompleted(true);
        setShowRatingModal(true);
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
            // Here you would send the ratings to your backend

            // You might want to call an API here
            // await submitProductRatings(ratings);

            // After successful submission, clear the cart and redirect
            clearCart();
            navigate("/");
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

    return (
        <div className="w-full h-full flex flex-col space-y-4 items-center justify-center p-4 bg-gray-950">
            <div className="w-full max-w-screen-lg bg-gray-50 rounded-xl flex flex-col relative">
                {/* Header */}
                <div className="w-full h-16 bg-[#2E2E2E] flex items-center rounded-t-xl px-6 top-0 z-10">
                    <ShoppingCart className="text-white h-5 w-5" />
                    <label className="text-orange-500 font-bold text-lg ml-3">SHOPPING CART</label>
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
                        />
                    </div>
                </div>
                <div className="w-full px-3 flex flex-wrap gap-4 justify-center">

                    {products.slice(0, 9).map((product, idx) => (
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
                    <button
                        className="w-2xl mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition-colors"
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