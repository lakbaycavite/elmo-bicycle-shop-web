import { ChevronLeft, ChevronRight, DiamondPlus, Search, ShoppingCart } from "lucide-react"
import { useState } from "react"
import CartCard from "../../components/CartCard";

const Cart = () => {

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

    return (
        <div className="w-full h-screen flex flex-col space-y-4 items-center justify-center p-4 bg-gray-950">
            <div className="w-[1200px] h-[400px] bg-gray-50 rounded-xl flex flex-col">
                <div className="w-full h-14 bg-[#2E2E2E] flex items-center rounded-t-xl px-3">
                    <ShoppingCart className="text-white" />
                    <label className="text-orange-500 font-bold text-lg ml-3">ADD TO CART</label>
                </div>
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