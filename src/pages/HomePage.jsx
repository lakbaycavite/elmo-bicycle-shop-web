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
      {/* More sections to be implemented next... */}
    </div>
  )
}

export default HomePage 