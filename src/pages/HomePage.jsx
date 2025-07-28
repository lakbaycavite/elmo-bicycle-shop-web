import Navbar from '../components/Navbar'
import BikesCategory from './post-auth/Bikes-category';
import { useAuth } from '../context/authContext/createAuthContext';
import { useEffect, useState } from 'react';
import { database } from '../firebase/firebase';
import { ref, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart'; // Import your useCart hook
import { toast } from 'sonner'; // For showing notifications

function HomePage() {

  const { userLoggedIn } = useAuth();
  const [latestBikes, setLatestBikes] = useState([]);
  const [gears, setGears] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const navigate = useNavigate();

  // Import cart functionality
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        const bikeProducts = allProducts.filter(product => product.category === 'Bikes');
        setLatestBikes(bikeProducts.slice(0, 8));

        const gearProducts = allProducts.filter(product => product.category === 'Gears');
        setGears(gearProducts.slice(0, 8));

        const accessoryProducts = allProducts.filter(product => product.category === 'Accessories');
        setAccessories(accessoryProducts.slice(0, 8));

      } else {
        setLatestBikes([]);
        setGears([]);
        setAccessories([]);
      }
    });
  }, []);

  // Handle add to cart functionality
  const handleAddToCart = async (product) => {
    // Check if user is logged in
    if (!userLoggedIn) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const productDetails = {
        name: product.name,
        price: product.price,
        imageUrl: product.image,
        brand: product.brand || '',
        category: product.category
      };

      await addToCart(product.id, 1, productDetails);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Navbar */}
      <Navbar isLoggedIn={userLoggedIn} />

      {/* Hero/Header Section */}
      <section className="w-full px-4 md:px-0 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto pt-12 pb-8">
        {/* Left: Text Content */}
        <div className="flex-1 md:pr-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Elmo Bicycle Shop</h1>
          <p className="text-gray-300 mb-6 max-w-lg">
            From sleek road bikes built for speed to rugged mountain bikes designed for off-road adventures, our slider celebrates the diversity of cycling disciplines.
          </p>
          <div className="flex gap-4 mb-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded transition" type='button' onClick={() => navigate('/customer/products')}>Shop Now</button>
            <button className="bg-white text-gray-900 font-semibold px-6 py-3 rounded transition hover:bg-gray-200" type='button' onClick={() => navigate('/customer/bikes-category')}>Explore Products</button>
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
            <p className="text-gray-300 text-sm text-center">Got a defective product? No worries — we'll handle it for you.</p>
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
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded mb-3 mt-2" type='button' onClick={() => navigate('/customer/bikes-category', { state: { ratingFilter: '5' } })}>Show More</button>
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

              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/bikes-category')}> Discover More</button>

            </div>
          </div>
          {/* Right: Accessories and Gears & Parts */}
          <div className="flex-1 flex flex-col gap-6 w-full">
            {/* Accessories Card */}
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Accessories</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/accessories-category')}>Shop Now</button>
            </div>
            {/* Gears & Parts Card */}
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Gears & Parts</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/gears-parts-category')}>Shop Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Latest Bicycle Section */}
      <section className="w-full bg-[#181818] py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-bold tracking-widest text-xs md:text-sm uppercase">Shop</span>
        </div>
        <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-2">Our Latest Bicycle</h2>
        <p className="text-center text-gray-300 mb-10 max-w-2xl mx-auto">
          Ultra-premium components, engineered by ProBike. The ultimate upgrade. Wherever you ride, we've got a bike for the joyrider in you.
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {latestBikes.length > 0 ? (
            latestBikes.map((bike) => (
              <div key={bike.id} className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
                <img src={bike.imageUrl || "/images/bike.png"} alt={bike.name} className="w-32 h-28 object-contain mb-4" />
                <div className="w-full text-center">
                  <h3 className="text-white font-semibold text-base mb-1">{bike.name}</h3>
                  <div className="text-gray-400 text-xs mb-1">{bike.brand}</div>
                  <div className="text-orange-400 text-sm mb-2">₱{bike.price}</div>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToCart(bike)}
                      disabled={cartLoading}
                    >
                      {cartLoading ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded hover:bg-gray-200">Details</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-white col-span-full">Loading latest bikes...</p>
          )}
        </div>
      </section>

      {/* Gear, Parts & Accessories Section */}
      <section className="w-full bg-white py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-bold tracking-widest text-xs md:text-sm uppercase">Shop</span>
        </div>
        <h2 className="text-center text-black text-xl md:text-2xl font-bold mb-2">Gear, Parts & Accessories</h2>
        <p className="text-center text-black mb-10 max-w-2xl mx-auto">
          Load up and head out. Explore the route less travelled or accelerate your daily routine with one of these rugged, versatile e-bikes.
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[...gears, ...accessories].length > 0 ? (
            [...gears, ...accessories].slice(0, 8).map((item) => (
              <div key={item.id} className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
                <img src={item.imageUrl || "/images/bikehelmet1.png"} alt={item.name} className="w-32 h-28 object-contain mb-4" />
                <div className="w-full text-center">
                  <h3 className="text-white font-semibold text-base mb-1">{item.name}</h3>
                  <div className="text-gray-400 text-xs mb-1">{item.category}</div>
                  <div className="text-orange-400 text-sm mb-2">₱{item.price}</div>
                  <div className="flex justify-center gap-2 mt-2">
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToCart(item)}
                      disabled={cartLoading}
                    >
                      {cartLoading ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded hover:bg-gray-200">Details</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-white col-span-full">Loading products...</p>
          )}
        </div>
      </section>
      {/* More sections to be implemented next... */}

      {/* Footer Section */}
      <footer id="contact-section" className="bg-[#181818] text-white pt-12 pb-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4">
          {/* Left: Contact Info */}
          <div className="flex-1 mb-8 md:mb-0">
            <div className="font-bold text-lg mb-2">
              <span className="text-orange-500">E</span><span className="text-white">BS</span>
            </div>
            <div className="text-gray-300 text-sm mb-1">Brokenshire, Panacan.</div>
            <div className="text-gray-300 text-sm mb-1">+63 9201234563</div>
            <div className="text-gray-300 text-sm mb-1">elmobikeshop24@gmail.com</div>
          </div>
          {/* Center: Shop Links */}
          <div className="flex-1 mb-8 md:mb-0">
            <div className="font-semibold mb-2 text-white text-left">Shop</div>
            <div className="text-white text-sm space-y-1 text-left flex flex-col">
              <div>
                <Link to="#" className="text-white no-underline hover:text-orange-500 transition">About Us</Link>
              </div>
              <div>
                <Link to="#" className="text-white no-underline hover:text-orange-500 transition">Our Bikes</Link>
              </div>
              <div>
                <Link to="#" className="text-white no-underline hover:text-orange-500 transition">Our Services</Link>
              </div>
            </div>
          </div>
          {/* Right: About & Socials */}
          <div className="flex-1">
            <div className="font-semibold mb-2 text-white">About The Shop</div>
            <div className="flex gap-4 mt-4">
              {/* Facebook SVG */}
              <Link to="#" aria-label="Facebook" className="text-white hover:text-orange-500 transition">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H5v4h5v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </Link>
              {/* Instagram SVG */}
              <Link to="#" aria-label="Instagram" className="text-white hover:text-orange-500 transition">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-400">
          2024 Copyright Act: <Link to="https://www.nyongt.com" className="text-orange-500 hover:underline">www.nyongt.com</Link>
        </div>
      </footer>
    </div>
  )
}

export default HomePage