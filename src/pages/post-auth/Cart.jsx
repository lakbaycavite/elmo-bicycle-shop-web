import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, DiamondPlus, Minus, Plus, RefreshCw, Search, ShoppingCart, Trash2 } from "lucide-react"
import { useState } from "react"
import CartCard from "../../components/CartCard";
import { useNavigate } from "react-router-dom";

const Cart = () => {

    const navigate = useNavigate();

    const initialCartItems = [
        {
            id: 1,
            name: "Fila 19 Mountain Bike",
            category: "Bikes",
            price: 19999.00,
            image: "https://images.unsplash.com/photo-1465101162946-4377e57745c3",
            quantity: 1
        },
        {
            id: 2,
            name: "Specialized Rockhopper",
            category: "Bikes",
            price: 24599.00,
            image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
            quantity: 1
        },
        {
            id: 3,
            name: "Trek FX Sport 4",
            category: "Bikes",
            price: 31999.00,
            image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890",
            quantity: 2
        },
        {
            id: 4,
            name: "Cannondale SuperSix",
            category: "Bikes",
            price: 42599.00,
            image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8",
            quantity: 1
        },
        {
            id: 5,
            name: "Giant Contend AR",
            category: "Bikes",
            price: 27899.00,
            image: "https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e",
            quantity: 1
        }
    ];


    const cards = [
        {
            title: "Sunset Boulevard",
            description: "Experience the serene beauty of the sun setting over the city skyline.",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
        },
        {
            title: "Mountain Escape",
            description: "Breathe in the fresh mountain air and enjoy nature's tranquility.",
            image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca"
        },
        {
            title: "Urban Jungle",
            description: "Discover the hidden gems nestled in the heart of the metropolis.",
            image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308"
        },
        {
            title: "Ocean Breeze",
            description: "Let the sound of waves and salty air wash your worries away.",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
        },
        {
            title: "Desert Adventure",
            description: "Embark on a thrilling journey across endless sands and dunes.",
            image: "https://images.unsplash.com/photo-1465101178521-c1a9136aabef"
        },
        {
            title: "Forest Retreat",
            description: "Unplug and unwind in the lush green embrace of the forest.",
            image: "https://images.unsplash.com/photo-1465101162946-4377e57745c3"
        }
    ];

    const [products, setProducts] = useState(cards);
    const [cartItems, setCartItems] = useState(initialCartItems);

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 0; // Free shipping
    const grandTotal = subtotal + shipping;

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return; // Prevent negative quantities

        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));
    };

    // Handle item removal
    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    // Format price to Philippine Peso
    const formatPrice = (price) => {
        return `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };


    return (
        <div className="w-full h-full flex flex-col space-y-4 items-center justify-center p-4 bg-gray-950">
            <div className="w-[1200px] h-[1000px] bg-gray-50 rounded-xl flex flex-col relative">
                {/* Header */}
                <div className="w-full h-16 bg-[#2E2E2E] flex items-center rounded-t-xl px-6 top-0 z-10">
                    <ShoppingCart className="text-white h-5 w-5" />
                    <label className="text-orange-500 font-bold text-lg ml-3">SHOPPING CART</label>
                </div>

                {/* Scrollable Product List */}
                <div className="flex-1 overflow-auto px-6">
                    <table className="table table-hover w-full">
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
                            {cartItems.map((item) => (
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
                                                src={item.image}
                                                className="w-24 h-24 object-cover rounded-lg"
                                                alt={item.name}
                                            />
                                            <div>
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-gray-500">Category: {item.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center justify-center">
                                            <button
                                                className="p-1 rounded-l bg-gray-100 border border-gray-300 hover:bg-gray-200"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus size={16} className="text-gray-600" />
                                            </button>
                                            <input
                                                type="text"
                                                value={item.quantity}
                                                className="w-12 h-8 text-center border-y border-gray-300 outline-none"
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) updateQuantity(item.id, val);
                                                }}
                                            />
                                            <button
                                                className="p-1 rounded-r bg-gray-100 border border-gray-300 hover:bg-gray-200"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus size={16} className="text-gray-600" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-5 text-right font-medium">
                                        {formatPrice(item.price)}
                                    </td>
                                    <td className="py-5 text-right font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Fixed Order Summary */}
                <div className="w-full border-t border-gray-200 bg-white p-5 rounded-b-xl">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            {/* <button className="flex items-center text-gray-600 hover:text-orange-500 mr-4">
                                <RefreshCw size={16} className="mr-1" />
                                <span>Update Cart</span>
                            </button> */}
                            <button className="flex items-center text-gray-600 hover:text-orange-500" onClick={() => navigate("/")}>
                                <ArrowLeft size={16} className="mr-1" />
                                <span>Continue Shopping</span>
                            </button>
                        </div>

                        <div className="flex items-end">
                            <div className="w-80 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-medium">{formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="font-bold text-lg">Grand Total:</span>
                                    <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
                                </div>

                                <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center">
                                    <CreditCard size={18} className="mr-2" />
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-[1200px] h-[500px] bg-[#2E2E2E] rounded-xl flex flex-col">
                <div className="w-full h-18 rounded-t-xl flex items-center justify-between px-3">
                    <div className="flex flex-row items-center ">
                        <DiamondPlus className="text-white" />
                        <label className="text-white font-bold text-xl ml-3">Add more product?</label>
                    </div>

                    <div className="relative w-72">
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
                <div className="w-full h-18 px-3 flex flex-row items-center justify-between">
                    <button
                        className="w-10 h-10 bg-orange-500 text-white flex justify-center items-center transition-all duration-150 active:scale-90 active:opacity-80 hover:bg-orange-400"
                        style={{ borderRadius: '100%' }}
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        className="w-10 h-10 bg-orange-500 text-white flex justify-center items-center transition-all duration-150 active:scale-90 active:opacity-80 hover:bg-orange-400"
                        style={{ borderRadius: '100%' }}
                    >
                        <ChevronRight />
                    </button>
                </div>
                <div className="w-full h-full p-3">
                    <div
                        className="flex overflow-x-auto space-x-6"
                    >
                        {products.map((product, idx) => (
                            <div key={idx} className="flex-none md:w-80">
                                <CartCard
                                    title={product.title}
                                    description={product.description}
                                    image={product.image}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Cart