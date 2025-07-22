import { FaBicycle, FaMotorcycle, FaCompass, FaTools, FaHeart, FaBars } from 'react-icons/fa';
import { FaGear, FaGears, FaXmark } from 'react-icons/fa6';
import { useState } from 'react';

const BikesCategory = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="h-screen bg-black">
      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-screen bg-black border-r border-gray-800 
                   overflow-y-auto transition-all duration-300 ease-in-out z-50
                   ${isDrawerOpen ? 'w-72' : 'w-20'}`}
        onMouseEnter={() => setIsDrawerOpen(true)}
        onMouseLeave={() => setIsDrawerOpen(false)}
      >
        <div className={`flex flex-col items-center py-6 border-b border-gray-800 ${isDrawerOpen ? 'px-6' : 'px-2'}`}>
          <div className={`bg-orange-500 rounded-xl flex items-center justify-center shadow-lg
                          transition-all duration-300 mb-4
                          ${isDrawerOpen ? 'w-20 h-20' : 'w-12 h-12'}`}>
            <img 
              src="/images/logos/elmo.png" 
              alt="Bicycle Shop Logo" 
              className={`transition-all duration-300 ${isDrawerOpen ? 'w-16 h-16' : 'w-10 h-10'}`} 
            />
          </div>
          <h1 className={`font-bold text-white transition-all duration-300 overflow-hidden whitespace-nowrap
                         ${isDrawerOpen ? 'text-2xl opacity-100' : 'text-lg opacity-0 w-0'}`}>
            BICYCLE SHOP
          </h1>
        </div>
        <nav className="flex-grow">
          <div className={`py-6 ${isDrawerOpen ? 'px-6' : 'px-2'}`}>
            <h2 className={`font-bold text-white flex items-center mb-4
                           ${isDrawerOpen ? 'text-lg' : 'justify-center'}`}>
              <FaGears className={`text-orange-400 ${isDrawerOpen ? 'mr-2' : ''}`} />
              <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap
                              ${isDrawerOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Filter by Type
              </span>
            </h2>
            <div className="space-y-2">
              {["Road Bike", "Mountain Bike", "Hybrid Bike", "Gravel Bike", "Touring Bike", "BMX Bike", 
                "Cyclocross Bike", "Folding Bike", "Electric Bike (E-Bike)", "Cruiser Bike", 
                "Fat Bike", "Fixed Gear Bike (Fixie)", "Track Bike", "Recumbent Bike", 
                "Tandem Bike", "Cargo Bike", "Commuter Bike", "Time Trial Bike", 
                "Triathlon Bike", "Kids Bike"].map((type, index) => (
                <div key={index} className="relative flex items-center group">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    id={`btncheck-${index}`}
                    autoComplete="off"
                  />
                  <label
                    className={`flex items-center p-3 text-sm rounded-lg cursor-pointer
                               bg-gray-900 border border-gray-800 hover:bg-gray-800 
                               peer-checked:bg-gray-800 peer-checked:border-orange-500
                               transition-all duration-300 ${isDrawerOpen ? 'w-full' : 'w-12 justify-center'}`}
                    htmlFor={`btncheck-${index}`}
                  >
                    <FaBicycle className={`text-orange-400 ${isDrawerOpen ? 'mr-3' : ''}`} />
                    <span className={`font-medium text-white transition-all duration-300 overflow-hidden whitespace-nowrap
                                    ${isDrawerOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                      {type}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen bg-black pl-24 pr-6 py-8">
        <header className="bg-gray-900 rounded-2xl shadow-sm p-6 mb-8 border border-gray-800">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search for bikes..."
                className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 rounded-xl 
                         text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                         transition-all duration-200"
              />
              <FaCompass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 text-lg" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl 
                               flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 
                               transition-all duration-200 shadow-sm">
                <FaBicycle className="text-lg" />
                <span className="font-medium">Bicycles</span>
              </button>
              <button className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                               flex items-center gap-2 hover:bg-gray-700 
                               transition-all duration-200">
                <FaTools className="text-orange-400 text-lg" />
                <span className="font-medium text-white">Accessories</span>
              </button>
              <button className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl 
                               flex items-center gap-2 hover:bg-gray-700 
                               transition-all duration-200">
                <FaGear className="text-orange-400 text-lg" />
                <span className="font-medium text-white">Gears and Parts</span>
              </button>
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Example Product Cards */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-800">
              <div className="relative">
                <img src="/images/bike.png" alt="Bike" className="w-full h-56 object-cover" />
                <button className="absolute top-4 right-4 p-2.5 bg-black/80 backdrop-blur-sm rounded-full
                                 hover:bg-black transition-all duration-200 border border-gray-800">
                  <FaHeart className="text-orange-400" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="text-xl font-bold text-white mb-1">TWITTER R10</h5>
                    <p className="text-sm text-gray-400">Twitter Road Bike</p>
                  </div>
                  <span className="text-2xl font-bold text-orange-400">₱39,900</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">Type: <span className="text-orange-400 font-medium">Road Bike</span></p>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 
                                   text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 
                                   transition-all duration-200">
                    Add to Cart
                  </button>
                  <button className="py-3 px-4 bg-gray-800 text-white rounded-xl font-medium 
                                   hover:bg-gray-700 transition-all duration-200">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BikesCategory;