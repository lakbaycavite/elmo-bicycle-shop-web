import { ArrowLeft, CreditCard, DiamondPlus, Minus, Plus, Search, ShoppingCart, Trash2, Clock } from "lucide-react";
import CartCard from "../../components/CartCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useProducts } from "../../hooks/useProduct";
import elmoLogo from '/images/logos/elmo.png';
import OrderDetailsModal from "../../components/OrderDetailsModal";
import { useState, useEffect, useMemo, useRef } from "react";
import ProductDetailsModal from "../../components/ProductsDetailsModal";
import { toast } from "sonner";
import { useOrder } from "../../hooks/useOrder";
import { database } from "../../firebase/firebase";
import { ref, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";

const Cart = () => {
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [viewProduct, setViewProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchFilter, setSearchFilter] = useState("");
    const [currentBatch, setCurrentBatch] = useState(0);
    const [scrollCount, setScrollCount] = useState(0);
    const [currentOrderId, setCurrentOrderId] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [productStocks, setProductStocks] = useState({});
    const [appliedVoucherDiscount, setAppliedVoucherDiscount] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const carouselRef = useRef(null);
    const auth = getAuth();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch all products for search functionality
    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const productsArray = Object.entries(data).map(([id, product]) => ({
                    id,
                    ...product
                }));
                setAllProducts(productsArray);
                
                // Also set product stocks
                const stocks = {};
                snapshot.forEach((childSnapshot) => {
                    stocks[childSnapshot.key] = childSnapshot.val().stock || 0;
                });
                setProductStocks(stocks);
            }
        });
        return () => unsubscribe();
    }, []);

    // Search filter effect
    useEffect(() => {
        if (searchFilter.trim() === "") {
            setFilteredProducts([]);
            return;
        }

        const results = allProducts.filter((product) => {
            const nameMatch = product.name?.toLowerCase().includes(searchFilter.toLowerCase());
            const categoryMatch = product.category?.toLowerCase().includes(searchFilter.toLowerCase());
            return nameMatch || categoryMatch;
        });

        setFilteredProducts(results);
    }, [searchFilter, allProducts]);

    const handleProductSelect = (product) => {
        if (!product || !product.category) return;
        
        let categoryPath = "";
        const category = product.category.toLowerCase();
        
        if (category === "bikes") {
            categoryPath = "bikes-category";
        } else if (category === "accessories") {
            categoryPath = "accessories-category";
        } else if (["gears", "parts"].includes(category)) {
            categoryPath = "gears-category";
        } else {
            console.warn("Unknown category:", category);
            return;
        }
        
        navigate(`/customer/${categoryPath}/${product.id}`);
        setSearchFilter("");
        setFilteredProducts([]);
    };

    const { cart, updateQuantity, removeItem, totalPrice, totalDiscount, addToCart, clearCart } = useCart();
    const { products, getProduct } = useProducts();
    const { subscribeToOrder, userOrders } = useOrder();
    const navigate = useNavigate();

    const availableProducts = useMemo(() => {
        return products.filter(product => 
            !cart.some(item => item.id === product.id) && 
            (productStocks[product.id] > 0 || productStocks[product.id] === undefined)
        );
    }, [products, cart, productStocks]);

    const randomProducts = useMemo(() => {
        if (!availableProducts.length) return [];
        const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 12);
    }, [availableProducts]);

    const scrollToCenter = (index) => {
        if (carouselRef.current && randomProducts.length > 0) {
            const container = carouselRef.current;
            const item = container.children[index];
            if (item) {
                const containerWidth = container.offsetWidth;
                const itemWidth = item.offsetWidth;
                const scrollLeft = item.offsetLeft - (containerWidth / 2) + (itemWidth / 2);
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleScroll = () => {
        if (!carouselRef.current) return;
        
        const container = carouselRef.current;
        const containerWidth = container.offsetWidth;
        const scrollPosition = container.scrollLeft + (containerWidth / 2);
        
        let closestItem = null;
        let closestDistance = Infinity;
        
        Array.from(container.children).forEach((item, index) => {
            const itemLeft = item.offsetLeft;
            const itemWidth = item.offsetWidth;
            const itemCenter = itemLeft + (itemWidth / 2);
            const distance = Math.abs(scrollPosition - itemCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestItem = index;
            }
        });
        
        if (closestItem !== null && closestItem !== currentBatch) {
            setCurrentBatch(closestItem);
        }
    };

    useEffect(() => {
        const container = carouselRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        if (randomProducts.length > 0) {
            scrollToCenter(currentBatch);
        }
    }, [currentBatch, randomProducts]);

    const validateStockBeforeCheckout = () => {
        for (const item of cart) {
            const availableStock = productStocks[item.id] || 0;
            if (item.quantity > availableStock) {
                toast.error(`Not enough stock for ${item.name}. Only ${availableStock} available`);
                return false;
            }
        }
        return true;
    };

    const updateProductStock = async (cart) => {
        const updates = {};
        for (const item of cart) {
            const currentStock = productStocks[item.id] ?? 0;
            const newStock = Math.max(currentStock - item.quantity, 0);
            updates[`products/${item.id}/stock`] = newStock;
        }
        try {
            await update(ref(database), updates);
            return true;
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update product stocks");
            return false;
        }
    };

    const handleCheckoutComplete = async (orderId, voucherDiscount = 0) => {
        setAppliedVoucherDiscount(voucherDiscount);
        
        if (!validateStockBeforeCheckout()) return;
        
        const stockUpdated = await updateProductStock(cart);
        if (!stockUpdated) return;

        setOrderCompleted(true);
        setShowOrderModal(false);
        setCurrentOrderId(orderId);
        clearCart();

        toast.success('Order placed successfully!', {
            action: {
                label: 'View Orders',
                onClick: () => navigate('/customer/profile')
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
    };

    const handleUpdateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return;
        const availableStock = productStocks[id] || 0;
        if (newQuantity > availableStock) {
            toast.warning(`Only ${availableStock} items available in stock`);
            return;
        }
        await updateQuantity(id, newQuantity);
    };

    const formatPrice = (price) => {
        return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    useEffect(() => {
        if (!currentOrderId) return;
        const unsubscribe = subscribeToOrder(currentOrderId);
        return () => unsubscribe && unsubscribe();
    }, [currentOrderId, subscribeToOrder]);

    useEffect(() => {
        if (!currentOrderId || !userOrders.length) return;
        const currentOrder = userOrders.find(order => order.id === currentOrderId);
        if (currentOrder && currentOrder.status === 'paid') {
            setCurrentOrderId(null);
            toast.success('Your order has been confirmed!', {
                action: { label: 'View Order', onClick: () => navigate('/customer/profile') },
                description: 'You can view details in "My Orders"'
            });
        }
    }, [userOrders, currentOrderId, navigate]);

    const renderSearchResults = () => {
        if (!searchFilter || filteredProducts.length === 0) return null;
        
        return (
            <div className="absolute z-20 bg-white shadow-lg mt-1 max-h-60 w-full sm:w-72 overflow-y-auto rounded border">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleProductSelect(product)}
                    >
                        <img
                            src={product.image || elmoLogo}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen flex flex-col space-y-4 items-center justify-start p-4 bg-gray-950">
            {/* Order Table Section */}
            <div className="w-full max-w-screen-lg bg-gray-50 rounded-xl flex flex-col relative overflow-x-auto">
                <div className="w-full min-w-[600px] h-16 bg-[#2E2E2E] flex items-center justify-between rounded-t-xl px-6 top-0 z-10">
                    <div className="flex items-center">
                        <ShoppingCart className="text-white h-5 w-5" />
                        <label className="text-orange-500 font-bold text-lg ml-3">SHOPPING CART</label>
                    </div>
                    <button
                        onClick={() => navigate('/customer/profile')}
                        className="flex items-center text-white hover:text-orange-300 transition-colors"
                    >
                        <Clock size={16} className="mr-1" />
                        <span className="text-sm">My Orders</span>
                    </button>
                </div>

                <div className="flex-1 px-4 sm:px-6 overflow-x-auto">
                    <table className="table-auto w-full min-w-[600px]">
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
                                        {Number(item.discount) > 0
                                            ? formatPrice(Number(item.discountedFinalPrice))
                                            : formatPrice(item.price)}
                                    </td>
                                    <td className="py-5 text-right font-medium">
                                        {Number(item.discount) > 0
                                            ? formatPrice(Number(item.discountedFinalPrice) * item.quantity)
                                            : formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="w-full min-w-[600px] border-t border-gray-200 bg-white p-5 rounded-b-xl">
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
                                <span className="text-red-500">
                                    {formatPrice(Math.max(appliedVoucherDiscount, totalDiscount))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <span className="font-bold text-lg">Grand Total:</span>
                                <span className="font-bold text-lg">
                                    {formatPrice(totalPrice - Math.max(appliedVoucherDiscount, totalDiscount))}
                                </span>
                            </div>

                            <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                                onClick={() => {
                                    if (cart.length === 0) {
                                        toast.warning("Your cart is empty");
                                        return;
                                    }
                                    if (!validateStockBeforeCheckout()) return;
                                    setShowOrderModal(true);
                                }}
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
                        <label className="text-white font-bold text-lg sm:text-xl ml-3">Add more products</label>
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
                        {renderSearchResults()}
                    </div>
                </div>

                {randomProducts.length > 0 && (
                    <div className="w-full px-3 relative mb-2 py-4">
                        <style>{`
                            .product-carousel {
                                scroll-snap-type: x mandatory;
                                scroll-behavior: smooth;
                            }
                            .product-carousel > div {
                                scroll-snap-align: center;
                                transition: transform 0.3s ease, opacity 0.3s ease;
                            }
                            .product-carousel > div:not(.center-item) {
                                opacity: 0.7;
                                transform: scale(0.9);
                            }
                            .product-carousel > div.center-item {
                                opacity: 1;
                                transform: scale(1);
                            }
                            .no-scrollbar::-webkit-scrollbar {
                                display: none;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}</style>

                        <div 
                            ref={carouselRef}
                            className="product-carousel flex overflow-x-auto w-full gap-4 px-4 py-4 no-scrollbar"
                        >
                            {randomProducts.map((product, index) => (
                                <div 
                                    key={product.id}
                                    className={`flex-shrink-0 w-[280px] ${index === currentBatch ? 'center-item' : ''}`}
                                >
                                    <CartCard
                                        productDetails={product}
                                        title={product.name}
                                        handleShowDetailsModal={handleShowDetailsModal}
                                        productId={product.id}
                                        description1={product.spec1}
                                        rating={product.rating}
                                        image={product.image ? product.image : elmoLogo}
                                        addToCart={addToCart}
                                        stock={productStocks[product.id]}
                                        formatPrice={formatPrice}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center gap-2 mt-4">
                            {randomProducts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentBatch(index)}
                                    className={`w-2 h-2 rounded-full ${index === currentBatch ? 'bg-orange-500' : 'bg-gray-500'}`}
                                    aria-label={`Go to product ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="w-full h-16 bg-[#2E2E2E] rounded-b-xl flex items-center justify-center">
                    <button
                        className="w-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        onClick={() => navigate("/customer/products")}
                    >
                        Show More Products
                    </button>
                </div>
            </div>

            <OrderDetailsModal
                show={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                onComplete={handleCheckoutComplete}
                appliedVoucherDiscount={appliedVoucherDiscount}
                setAppliedVoucherDiscount={setAppliedVoucherDiscount}
            />
            <ProductDetailsModal
                viewProduct={viewProduct}
                showDetailsModal={showDetailsModal}
                setShowDetailsModal={setShowDetailsModal}
                formatPrice={formatPrice}
                stock={viewProduct ? productStocks[viewProduct.id] : 0}
            />
        </div>
    );
};

export default Cart;