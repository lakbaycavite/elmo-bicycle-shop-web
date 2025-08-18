import Navbar from '../components/Navbar';
import BikesCategory from './post-auth/Bikes-category';
import { useAuth } from '../context/authContext/createAuthContext';
import { useEffect, useState } from 'react';
import { database, auth } from '../firebase/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { toast } from 'sonner';
import { Flame, Heart } from 'lucide-react';
import ProductDetailsModal2 from '../components/ProductsDetailsModal2';

function HomePage() {
  const { userLoggedIn } = useAuth();
  const [latestBikes, setLatestBikes] = useState([]);
  const [gears, setGears] = useState([]);
  const [parts, setParts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentAddingProduct, setCurrentAddingProduct] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});
  const navigate = useNavigate();

  const { cart, loading: cartLoading } = useCart();
  const { wishlist, addItem: addToWishlist, removeItem: removeFromWishlist, refreshWishlist } = useWishlist();

  // ===== EMAIL VERIFICATION CHECK =====
  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/login');
      return;
    }

    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      toast.warning("Please verify your email to access the homepage");
      navigate('/verify-email'); // redirect to your verification page
    }
  }, [userLoggedIn, navigate]);
  // ====================================

  // Load products
  useEffect(() => {
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          availableStock: data[key].stock,
          canBeRated: true
        }));

        allProducts.forEach(product => {
          const productRef = ref(database, `products/${product.id}/stock`);
          onValue(productRef, (stockSnap) => {
            const updatedStock = stockSnap.val();
            setLatestBikes(prev => updateProductStock(prev, product.id, updatedStock));
            setGears(prev => updateProductStock(prev, product.id, updatedStock));
            setParts(prev => updateProductStock(prev, product.id, updatedStock));
            setAccessories(prev => updateProductStock(prev, product.id, updatedStock));
          });
        });

        setLatestBikes(allProducts.filter(product => product.category === 'Bikes').slice(0, 8));
        setGears(allProducts.filter(product => product.category === 'Gears').slice(0, 8));
        setAccessories(allProducts.filter(product => product.category === 'Accessories').slice(0, 8));
        setParts(allProducts.filter(product => product.category === 'Parts').slice(0, 8));
      } else {
        setLatestBikes([]);
        setGears([]);
        setAccessories([]);
        setParts([]);
      }
    });
  }, []);

  // Load ratings
  useEffect(() => {
    const ratingsRef = ref(database, 'ratings');
    const unsubscribe = onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const processedRatings = {};
        Object.keys(data).forEach(productId => {
          const productRatings = data[productId];
          if (productRatings && typeof productRatings === 'object') {
            processedRatings[productId] = productRatings;
          }
        });
        setRatingsMap(processedRatings);
      } else {
        setRatingsMap({});
      }
    }, (error) => {
      console.error('Error loading ratings:', error);
    });
    return () => unsubscribe();
  }, []);

  const updateProductStock = (products, productId, newStock) => {
    return products.map(product => 
      product.id === productId ? { ...product, availableStock: newStock } : product
    );
  };

  const handleAddToCart = async (product) => {
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    setCurrentAddingProduct(product.id);

    try {
      if (!userLoggedIn) {
        toast.error('Please log in to add items to cart');
        navigate('/login');
        return;
      }

      if (cart.some(item => item.id === product.id)) {
        toast.error(`${product.name} is already in your cart`);
        return;
      }

      if (product.availableStock <= 0) {
        toast.error('This product is out of stock');
        return;
      }

      const productRef = ref(database, `products/${product.id}`);
      const snapshot = await get(productRef);
      const currentProduct = snapshot.val();
      
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      if (currentProduct.stock <= 0) {
        toast.error('This product is now out of stock');
        return;
      }

      const cartItem = {
        id: product.id,
        productId: product.id, // Added for consistency with rating system
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.image || "/images/bike.png",
        category: product.category,
        quantity: 1,
        brand: product.brand || '',
        type: product.type || '',
        description: product.description || "",
        discountedFinalPrice: product.discountedFinalPrice || 0,
        discount: product.discount || 0,
        stock: currentProduct.stock,
        addedAt: Date.now(),
        canBeRated: true // Explicitly enable rating
      };

      await update(ref(database, `users/${auth.currentUser.uid}/cart/${product.id}`), cartItem);
      toast.success(`${product.name} added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.message.includes('PERMISSION_DENIED')) {
        toast.error('You do not have permission to perform this action. Please contact support.');
      } else {
        toast.error(`Failed to add item to cart: ${error.message}`);
      }
    } finally {
      setIsAddingToCart(false);
      setCurrentAddingProduct(null);
    }
  };

  const handleToggleWishlist = async (product) => {
    if (!userLoggedIn) {
      toast.error('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }

    try {
      const inWishlist = wishlist.some(item => item.productId === product.id);
      if (inWishlist) {
        const wishlistItem = wishlist.find(item => item.productId === product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast.success(`${product.brand || product.name} removed from wishlist!`);
        }
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl || product.image || "/images/bike.png",
          category: product.category,
          brand: product.brand || '',
          type: product.type || '',
          description: product.description || "",
          discountedFinalPrice: product.discountedFinalPrice || 0,
          discount: product.discount || 0
        });
        toast.success(`${product.brand || product.name} added to wishlist!`);
      }
      refreshWishlist();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast.error(`Error updating wishlist: ${error.message}`);
    }
  };

  const isInWishlist = (productId) => wishlist.some(item => item.productId === productId);

  const handleProductDetails = (product, isLatestBike = false) => {
    setViewProduct({
      ...product,
      image: product.imageUrl || product.image || (isLatestBike ? "/images/bike.png" : "/images/bikehelmet1.png")
    });
    setShowDetailsModal(true);
  };

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice)) return '₱0.00';
    return `₱${numPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  const ProductCard = ({ product, isLatestBike = false }) => {
    // Calculate average rating
    const productRatings = ratingsMap[product.id] || {};
    const ratingsArray = Object.values(productRatings);
    let averageRating = null;
    let totalRatings = 0;
    
    if (ratingsArray.length > 0) {
      const validRatings = ratingsArray.filter(rating =>
        rating && rating.rating && !isNaN(Number(rating.rating))
      );
      
      if (validRatings.length > 0) {
        const sum = validRatings.reduce((total, rating) => total + Number(rating.rating), 0);
        averageRating = (sum / validRatings.length).toFixed(1);
        totalRatings = validRatings.length;
      }
    }

    return (
      <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md relative">
        {product.availableStock <= 0 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            OUT OF STOCK
          </div>
        )}
        
        {product.discount > 0 && product.availableStock > 0 && (
          <div className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
        
        {userLoggedIn && (
          <div
            className="absolute top-3 right-3 cursor-pointer transition-all duration-200 hover:scale-110 z-10"
            onClick={() => handleToggleWishlist(product)}
            style={{
              color: isInWishlist(product.id) ? '#ff8c00' : '#9ca3af',
              opacity: isInWishlist(product.id) ? 1 : 0.6
            }}
          >
            <Heart
              size={20}
              fill={isInWishlist(product.id) ? "currentColor" : "none"}
              className="transition-all duration-200"
            />
          </div>
        )}

        <img
          src={product.imageUrl || product.image || (isLatestBike ? "/images/bike.png" : "/images/bikehelmet1.png")}
          alt={product.name}
          className="w-32 h-28 object-contain mb-4"
        />
        <div className="w-full text-center">
          <h3 className="text-white font-semibold text-base mb-1">{product.name}</h3>
          <div className="text-gray-400 text-xs mb-1">{product.brand || product.category}</div>
          
          {/* Ratings display */}
          {averageRating && totalRatings > 0 ? (
            <div className="mb-1">
              <span style={{ color: 'gold' }}>★ {averageRating}</span>
              <small className="text-gray-400 ml-1">({totalRatings})</small>
            </div>
          ) : (
            <div className="text-gray-400 text-xs mb-1">No ratings yet</div>
          )}
          
          <div className="text-orange-400 text-sm mb-2">
            {Number(product.discount) <= 0 || !product.discount ? (
              <>{product.price ? formatPrice(product.price) : '₱0.00'}</>
            ) : (
              <>
                <span className="text-gray-500 line-through">
                  {product.price ? formatPrice(product.price) : '₱0.00'}
                </span>
                {(() => {
                  const price = Number(product.price);
                  const discount = Number(product.discount);
                  if (isNaN(price) || isNaN(discount) || price <= 0) return '₱0.00';
                  const discountedPrice = price * (1 - (discount / 100));
                  return ` ₱${discountedPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
                })()}
              </>
            )}
          </div>
          <div className="flex justify-center gap-2 mt-2">
            <button
              className={`bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-3 py-1 rounded ${
                cartLoading || product.availableStock <= 0 || (isAddingToCart && currentAddingProduct === product.id)
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={() => handleAddToCart(product)}
              disabled={cartLoading || product.availableStock <= 0 || (isAddingToCart && currentAddingProduct === product.id)}
            >
              {(isAddingToCart && currentAddingProduct === product.id) ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              className="bg-white text-gray-900 text-xs font-semibold px-3 py-1 rounded hover:bg-gray-200"
              type='button'
              onClick={() => handleProductDetails(product, isLatestBike)}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <Navbar isLoggedIn={userLoggedIn} />

      <section className="w-full px-4 md:px-0 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto pt-15 pb-8">
        <div className="flex-1 md:pr-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Elmo Bike Shop</h1>
          <p className="text-gray-300 mb-6 max-w-lg">
            From sleek road bikes built for speed to rugged mountain bikes designed for off-road adventures, our slider celebrates the diversity of cycling disciplines.
          </p>
          <div className="flex gap-4 mb-4">
   <button 
              className="bg-orange-600 text-white font-semibold px-6 py-3 rounded transition" 
              type='button' 
              onClick={() => {
                navigate('/customer/home');
                setTimeout(() => {
                  const section = document.getElementById('categories-section');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              Shop Now
            </button>
           <button
  className="bg-white text-gray-900 font-semibold px-6 py-3 rounded transition hover:bg-gray-200"
  type="button"
  onClick={() => {
    navigate('/customer/bikes-category');
  }}
>
  Explore Products
</button>

          </div>
        </div>
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

      <section id="features-section" className="w-full bg-[#181818] py-10">
        <h2 className="text-center text-white text-lg md:text-xl font-bold tracking-widest mb-10 uppercase">Our Features & Facilities</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4">
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/lottery.png" alt="Spin The Wheel" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Spin The Wheel</h3>
            <p className="text-gray-300 text-sm text-center">Try your luck and win exclusive discounts</p>
          </div>
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Sale.png" alt="Occasional Promos" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Occasional Promos</h3>
            <p className="text-gray-300 text-sm text-center">Stay tuned for our exclusive events and limited-time promos!</p>
          </div>
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Warranty.png" alt="Warranty" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Warranty</h3>
            <p className="text-gray-300 text-sm text-center">Only bikes are covered by warranty — reach out to learn more!</p>
          </div>
          <div className="bg-[#232323] rounded-lg flex flex-col items-center p-6 shadow-md">
            <img src="/images/icons/Job.png" alt="Maintenance" className="w-14 h-14 mb-4" />
            <h3 className="text-white font-semibold text-base mb-2 text-center">Maintenance</h3>
            <p className="text-gray-300 text-sm text-center">Got a defective product? No worries — we'll handle it for you.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#f5f5f5] py-12">
        <div className="bg-white rounded-lg p-8 flex flex-col justify-center items-center shadow-md">
          <h3 className="text-black font-semibold text-base mb-2 text-center">The Most Popular Bikes</h3>
          <button 
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded mb-3 mt-2" 
            type='button' 
            onClick={() => navigate('/customer/bikes-category', { state: { ratingFilter: '5' } })}
          >
            Show More
          </button>
          <p className="text-gray-700 text-sm text-center">
            Want To Take Cycling To The Next Level<br />Be creative and organized to find more time to ride.
          </p>
        </div>
      </section>

      <section id="categories-section" className="w-full bg-[#181818] py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-semibold tracking-widest text-xs md:text-sm uppercase">Your Ride Start Here.</span>
        </div>
        <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-8">Our Categories</h2>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 px-4 items-center md:items-start">
          <div className="flex-1 bg-white rounded-lg flex flex-col items-center p-8 shadow-md mb-8 md:mb-0">
            <img src="/images/bike 2.png" alt="Blue Bike" className="w-48 h-40 object-contain mb-4" />
            <div className="w-full text-center">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Bicycles</h3>
              <p className="text-gray-700 text-sm mb-4">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/bikes-category')}> Discover More</button>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Accessories</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/accessories-category')}>Shop Now</button>
            </div>
            <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-md">
              <h3 className="text-black font-semibold text-base mb-2 uppercase">Gears & Parts</h3>
              <p className="text-gray-700 text-sm mb-4 text-center">Close-out pricing on dozens of products</p>
              <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded" type='button' onClick={() => navigate('/customer/gears-parts-category')}>Shop Now</button>
            </div>
          </div>
        </div>
      </section>

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
              <ProductCard key={bike.id} product={bike} isLatestBike={true} />
            ))
          ) : (
            <p className="text-center text-white col-span-full">Loading latest bikes...</p>
          )}
        </div>
      </section>

      <section className="w-full bg-white py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-bold tracking-widest text-xs md:text-sm uppercase">Shop</span>
        </div>
        <h2 className="text-center text-black text-xl md:text-2xl font-bold mb-2">Gear, Parts & Accessories</h2>
        <p className="text-center text-black mb-10 max-w-2xl mx-auto">
          Load up and head out. Explore the route less travelled or accelerate your daily routine with one of these rugged, versatile e-bikes.
        </p>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[...gears, ...accessories, ...parts].length > 0 ? (
            [...gears, ...accessories, ...parts].slice(0, 8).map((item) => (
              <ProductCard key={item.id} product={item} isLatestBike={false} />
            ))
          ) : (
            <p className="text-center text-white col-span-full">Loading products...</p>
          )}
        </div>
      </section>

      <ProductDetailsModal2
        showDetailsModal={showDetailsModal}
        viewProduct={viewProduct}
        setShowDetailsModal={setShowDetailsModal}
        formatPrice={formatPrice}
      />

      <footer id="contact-section" className="bg-[#181818] text-white pt-12 pb-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 px-4">
          <div className="flex-1 mb-8 md:mb-0">
            <div className="font-bold text-lg mb-2">
              <span className="text-orange-500">E</span><span className="text-white">BS</span>
            </div>
            <div className="text-gray-300 text-sm mb-1">Binalonan, Pangasinan.</div>
            <div className="text-gray-300 text-sm mb-1">+63 9201234563</div>
            <div className="text-gray-300 text-sm mb-1">elmobikeshop24@gmail.com</div>
          </div>
          <div className="flex-1 mb-8 md:mb-0">
            <div className="font-semibold mb-2 text-white text-left">Shop</div>
            <div className="text-white text-sm space-y-1 text-left flex flex-col">
              <div>
                <Link to="#" className="text-white no-underline hover:text-orange-500 transition" onClick={() => {
                  setTimeout(() => {
                    const section = document.getElementById('features-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}>About Us</Link>
              </div>
              <div>
                <Link to="/customer/bikes-category" className="text-white no-underline hover:text-orange-500 transition">Our Bikes</Link>
              </div>
              <div>
                <Link to="#" className="text-white no-underline hover:text-orange-500 transition" onClick={() => {
                  setTimeout(() => {
                    const section = document.getElementById('features-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}>Our Services</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-400">
          2024 Copyright Act: <Link to="https://www.nyongt.com" className="text-orange-500 hover:underline">www.nyongt.com</Link>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;