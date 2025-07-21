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
      {/* More sections to be implemented next... */}
    </div>
  )
}

export default HomePage 