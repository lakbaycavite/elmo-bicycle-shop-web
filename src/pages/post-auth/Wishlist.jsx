import { ArrowLeft, Heart } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {

    const wishlistsData = [{
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
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 4,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 5,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 6,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 7,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 8,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 9,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 10,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 11,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 12,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    }, {
        id: 13,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 14,
        name: "Specialized Rockhopper",
        category: "Bikes",
        price: 24599.00,
        image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
        quantity: 1
    },
    {
        id: 15,
        name: "Trek FX Sport 4",
        category: "Bikes",
        price: 31999.00,
        image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890",
        quantity: 2
    }
        , {
        id: 16,
        name: "Trek FX Sport 4",
        category: "Bikes",
        price: 31999.00,
        image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890",
        quantity: 2
    }]

    const navigate = useNavigate();

    const [wishlists, setWishlists] = useState(wishlistsData);

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

                        <select className=" rounded-md p-2 w-full sm:w-40 text-white" aria-label="Category filter" style={{ background: "#ff6900" }}>
                            <option selected>All</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                        <select className="rounded-md p-2 sm:w-40 text-white" aria-label="Price sort" style={{ background: "#ff6900" }}>
                            <option selected>Sort by Price</option>
                            <option value="1">1-1000</option>
                            <option value="2">1000-3000</option>
                            <option value="3">3000-7000</option>
                        </select>
                    </div>
                    <input
                        className="w-full sm:w-72 h-10 bg-stone-800 rounded-xl pl-4 placeholder-gray-400 text-white"
                        placeholder="Search..."
                        type="text"
                    />
                </div>
                <div className='bg-stone-800 w-full rounded-lg p-5 md:p-5' style={{ maxHeight: '500px' }}>
                    <div className='overflow-auto max-h-[400px]'>
                        <table className="min-w-full rounded-top" style={{ background: "#27272a", borderCollapse: "collapse" }}>
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="rounded-tl-md p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>#</th>
                                    <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Product</th>
                                    <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Price</th>
                                    <th scope="col" className="p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Category</th>
                                    <th scope="col" className="rounded-tr-md p-2 text-left" style={{ background: "#181a1b", color: "#ff6900", border: "none" }}>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlists.map((item, index) => (
                                    <tr key={item.id} style={{ background: "transparent", border: "none" }}>
                                        <td scope="row" className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{index + 1}</td>
                                        <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{item.name}</td>
                                        <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>${item.price.toFixed(2)}</td>
                                        <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{item.category}</td>
                                        <td className="p-2" style={{ background: "transparent", color: "white", border: "none" }}>{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Wishlist