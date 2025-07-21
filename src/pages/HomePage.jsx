import Navbar from '../components/Navbar'

function HomePage() {
  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Navbar */}
      <Navbar isLoggedIn={false} />

      {/* Hero/Header Section */}
      <section className="w-full px-4 md:px-0 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto pt-12 pb-8">
        {/* Left: Text Content */}
        <div className="flex-1 md:pr-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Elmo Bicycle Shop</h1>
          <p className="text-gray-300 mb-6 max-w-lg">
            From sleek road bikes built for speed to rugged mountain bikes designed for off-road adventures, our slider celebrates the diversity of cycling disciplines.
          </p>
          <div className="flex gap-4 mb-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded transition">Shop Now</button>
            <button className="bg-white text-gray-900 font-semibold px-6 py-3 rounded transition hover:bg-gray-200">Explore Products</button>
          </div>
        </div>
        {/* Right: Hero Image (no overlays, no border, full scale) */}
        <div className="flex-1 flex flex-col items-center md:items-end mt-8 md:mt-0">
          <div className="w-[320px] h-[180px] md:w-[400px] md:h-[220px] flex items-center justify-center bg-transparent">
            <img
              src="/images/icons/HeroPageImage.png"
              alt="Hero Bike"
              className="w-full h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Our Features & Facilities Section */}
      <section className="w-full bg-[#181818] py-10">
        <h2 className="text-center text-white text-lg md:text-xl font-bold tracking-widest mb-10 uppercase">Our Features & Facilities</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4">
          {/* Feature 1 */}
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Job.png" alt="Spin The Wheel" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Spin The Wheel</h3>
            <p className="text-gray-300 text-sm text-center">Try your luck and win exclusive discounts</p>
          </div>
          {/* Feature 2 */}
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Sale.png" alt="Occasional Promos" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Occasional Promos</h3>
            <p className="text-gray-300 text-sm text-center">Stay tuned for our exclusive events and limited-time promos!</p>
          </div>
          {/* Feature 3 */}
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Warranty.png" alt="Warranty" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Warranty</h3>
            <p className="text-gray-300 text-sm text-center">Only bikes are covered by warranty — reach out to learn more!</p>
          </div>
          {/* Feature 4 */}
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/lottery.png" alt="Maintenance" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Maintenance</h3>
            <p className="text-gray-300 text-sm text-center">Got a defective product? No worries — we’ll handle it for you.</p>
          </div>
        </div>
      </section>

      {/* Best Sellers Products This week Section */}
      <section className="w-full bg-[#f5f5f5] py-12">
        <h2 className="text-center text-black text-xl md:text-2xl font-bold mb-10">Best Sellers Products<br />This week</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {/* Most Popular Bike This Month */}
          <div className="bg-white rounded-lg p-8 flex flex-col justify-center items-center shadow-md">
            <h3 className="text-black font-semibold text-base mb-2 text-center">The Most Popular Bike This Month</h3>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded mb-3 mt-2">Show More</button>
            <p className="text-gray-700 text-sm text-center">Want To Take Cycling To The Next Level<br />Be creative and organized to find more time to ride.</p>
          </div>
          {/* Most Popular Bike This Week */}
          <div className="bg-[#232323] rounded-lg p-8 flex flex-col justify-center items-center shadow-md">
            <h3 className="text-white font-semibold text-base mb-2 text-center">Most Popular Bike This Week</h3>
            <div className="text-gray-400 text-sm mb-3 mt-2">COMING SOON!</div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded">Show More</button>
            <div className="text-gray-400 text-xs mt-4 text-center">
              Price: Unknown<br />Stock: Unknown<br />Weight: Unknown
            </div>
          </div>
        </div>
      </section>

      {/* Our Categories Section */}
      <section className="w-full bg-[#181818] py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-semibold tracking-widest text-xs md:text-sm uppercase">Your Ride Start Here.</span>
        </div>
        <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-8">Our Categories</h2>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 px-4 items-center md:items-start">
          {/* Left: Blue Bike Category */}
          <div className="flex-1 bg-white rounded-lg flex flex-col items-center p-8 shadow-md mb-8 md:mb-0">
            <img src="/images/bike 2.png" alt="Blue Bike" className="w-48 h-40 object-contain mb-4" />
            <div className="w-full text-center">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Bicycles</h3>
              <p className="text-gray-700 text-sm mb-4">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded">Discover More</button>
            </div>
          </div>
          {/* Right: Accessories and Gears & Parts */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {/* Accessories Card */}
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Accessories</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded">Shop Now</button>
            </div>
            {/* Gears & Parts Card */}
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Gears & Parts</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded">Shop Now</button>
            </div>
          </div>
        </div>
      </section>
      {/* More sections to be implemented next... */}
    </div>
  )
}

export default HomePage 