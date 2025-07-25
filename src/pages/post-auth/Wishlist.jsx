import { ArrowLeft, Heart, HeartCrack, ShoppingCart, X } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

const Wishlist = () => {

    const { addToCart } = useCart();
    const { wishlist, loading, removeItem, error, removeFromWishlist, clearItems, moveItemToCart } = useWishlist(addToCart);
    const navigate = useNavigate();

    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priceSort, setPriceSort] = useState('');

    console.log("Wishlist items:", wishlist);

    const filteredWishlist = useMemo(() => {
        return wishlist.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            if (priceSort) {
                const priceRanges = {
                    '0': [0, Infinity],
                    '1': [0, 5000],
                    '2': [5000, 10000],
                    '3': [10000, 20000],
                    '4': [20000, Infinity]
                };
                const [minPrice, maxPrice] = priceRanges[priceSort];
                return matchesSearch && matchesCategory && item.price >= minPrice && item.price < maxPrice;
            }
            return matchesSearch && matchesCategory;
        })
    }, [wishlist, searchFilter, categoryFilter, priceSort])


    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-b from-stone-900 via-stone-900 to-orange-500 flex-col p-4">
            <Heart className='text-orange-500' size={50} />
            <p className='text-orange-500 text-3xl md:text-4xl lg:text-5xl mb-6'>YOUR WISHLIST</p>
            <div className='bg-transparent w-full max-w-[1000px]'>

                <div className='w-full flex flex-col sm:flex-row justify-between gap-4 mb-4'>
                    <div className='flex flex-col sm:flex-row gap-3 w-72 sm:w-auto'>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-1 text-orange-500 hover:text-orange-300 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Back</span>
                        </button>

                        <select className=" rounded-md p-2 w-full sm:w-40 text-white" aria-label="Category filter" style={{ background: "#ff6900" }}
                            onClick={(e) => setCategoryFilter(e.target.value)}
                            defaultValue={"All"}>
                            <option value="All">All</option>
                            <option value="Bikes">Bikes</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Gears">Gears & Parts</option>
                        </select>
                        <select className="rounded-md p-2 sm:w-40 text-white" aria-label="Price sort" style={{ background: "#ff6900" }}
                            onChange={(e) => setPriceSort(e.target.value)}>
                            <option value="" selected disabled>Sort by Price</option>
                            <option value="0">All</option>
                            <option value="1">PHP 1 - 5,000</option>
                            <option value="2">PHP 5,000 - 10,000</option>
                            <option value="3">PHP 10,000 - 20,000</option>
                            <option value="4">PHP 20,000+</option>
                        </select>
                    </div>
                    <input
                        className="w-full sm:w-72 h-10 bg-stone-800 rounded-xl pl-4 placeholder-gray-400 text-white"
                        placeholder="Search..."
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                    />
                </div>
                <div className='bg-stone-800 w-full rounded-lg p-5 md:p-5' style={{ maxHeight: '500px' }}>
                    <div className='overflow-auto max-h-[400px]'>

                        {wishlist.length === 0 ? (
                            <>
                                <div className=" text-white rounded-lg p-8 flex flex-col items-center justify-center">
                                    <div className="text-6xl mb-4">
                                        <HeartCrack />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                                    <p className="text-gray-400 mb-6">Find items you love and add them to your wishlist!</p>
                                    <button
                                        onClick={() => navigate('/customer/products')}
                                        className="bg-[#ff6900] hover:bg-[#e55e00] text-white py-2 px-6 rounded-full"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <table className="min-w-full rounded-top" style={{ background: "#27272a", borderCollapse: "collapse" }}>
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th scope="col" className="rounded-tl-md p-2 text-center" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}></th>
                                            <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}></th>
                                            <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Product</th>
                                            <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Price</th>
                                            <th scope="col" className="rounded-tr-md p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Category</th>
                                            <th scope="col" className="p-2 text-center" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWishlist.map((item, index) => (
                                            <tr key={item.id} style={{ background: "transparent", border: "none" }}>
                                                <td scope="row" className="text-center" style={{ background: "transparent", color: "white", border: "none" }}>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="bg-opacity-75 text-white p-1 rounded-full"
                                                    >
                                                        <X size={16} className='text-white' />
                                                    </button>

                                                </td>
                                                <td className="p-2 flex justify-center items-center" style={{ background: "transparent", color: "white", border: "none" }}>
                                                    <img
                                                        src={item.image || 'https://via.placeholder.com/300x200'}
                                                        alt={item.name}
                                                        className="w-24 h-24 object-cover rounded-xl"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/300x200';
                                                        }}
                                                    />
                                                </td>
                                                <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{item.name}</td>
                                                <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>₱{parseFloat(item.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{item.category}</td>
                                                <td className="p-2 text-center" style={{ background: "transparent", color: "white", border: "none" }}>
                                                    <button className='' onClick={() => moveItemToCart(item.id)} style={{ background: "#ff6900", color: "white", padding: "0.5rem 1rem", borderRadius: "0.375rem" }} disabled={loading}>
                                                        <ShoppingCart size={16} className='inline mr-1' />
                                                        Add to Cart
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Wishlist