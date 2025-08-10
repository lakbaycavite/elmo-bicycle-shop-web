import Navbar from '../components/Navbar';
import { useAuth } from '../context/authContext/createAuthContext';
import { useEffect, useState } from 'react';
import { database } from '../firebase/firebase';
import { ref, onValue, set } from 'firebase/database';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import ProductDetailsModal2 from '../components/ProductsDetailsModal2';
import { useStockManagement } from '../hooks/useStockManagement';
import ProductCard from '../components/ProductCard';

function HomePage() {
  const { userLoggedIn } = useAuth();
  const [latestBikes, setLatestBikes] = useState([]);
  const [gears, setGears] = useState([]);
  const [parts, setParts] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const navigate = useNavigate();

  const { addToCart, removeFromCart, loading: cartLoading, cart } = useCart();
  const { wishlist, addItem: addToWishlist, removeItem: removeFromWishlist, refreshWishlist } = useWishlist(addToCart);
  const { stockMap, setStockMap, updateStockInFirebase } = useStockManagement();

  useEffect(() => {
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        setLatestBikes(allProducts.filter(product => product.category === 'Bikes').slice(0, 8));
        setGears(allProducts.filter(product => product.category === 'Gears').slice(0, 8));
        setAccessories(allProducts.filter(product => product.category === 'Accessories').slice(0, 8));
        setParts(allProducts.filter(product => product.category === 'Parts').slice(0, 8));

        const initialStock = {};
        allProducts.forEach(product => {
          initialStock[product.id] = product.stock ?? 0;
        });
        setStockMap(initialStock);
      } else {
        setLatestBikes([]);
        setGears([]);
        setAccessories([]);
        setParts([]);
        setStockMap({});
      }
    });
  }, []);

  const handleAddToCart = async (product) => {
    if (!userLoggedIn) {
      toast.error('Please log in to add items to cart');
      navigate('/login');
      return;
    }

    const currentStock = stockMap[product.id] ?? 0;
    if (currentStock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      const newStock = currentStock - 1;
      await updateStockInFirebase(product.id, newStock);
      
      await addToCart(product.id, 1, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.image || "/images/bike.png",
        category: product.category,
        brand: product.brand || '',
        type: product.type || '',
        discount: product.discount || 0
      });

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const cartItem = cart.find(item => item.productId === productId);
      if (!cartItem) return;

      const currentStock = stockMap[productId] ?? 0;
      const newStock = currentStock + cartItem.quantity;
      await updateStockInFirebase(productId, newStock);
      await removeFromCart(cartItem.id);

      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
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
        await removeFromWishlist(wishlistItem.id);
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrl || product.image || "/images/bike.png",
          category: product.category,
          brand: product.brand || '',
          type: product.type || '',
          discount: product.discount || 0
        });
        toast.success(`${product.name} added to wishlist!`);
      }
      refreshWishlist();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const isInWishlist = (productId) => wishlist.some(item => item.productId === productId);

  const handleProductDetails = (product) => {
    setViewProduct({
      ...product,
      image: product.imageUrl || product.image || "/images/bike.png"
    });
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <Navbar isLoggedIn={userLoggedIn} />

      {/* Hero Section */}
      <section className="w-full px-4 md:px-0 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto pt-12 pb-8">
        <div className="flex-1 md:pr-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Elmo Bike Shop</h1>
          <p className="text-gray-300 mb-6 max-w-lg">
            From sleek road bikes to rugged mountain bikes, we celebrate cycling diversity.
          </p>
          <div className="flex gap-4 mb-4">
            <button 
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded transition" 
              onClick={() => navigate('/customer/products')}
            >
              Shop Now
            </button>
            <button 
              className="bg-white text-gray-900 font-semibold px-6 py-3 rounded transition hover:bg-gray-200" 
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Products
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <img
            src="/images/icons/HeroPageImage.png"
            alt="Hero Bike"
            className="w-full max-w-[400px] object-contain rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Product Sections */}
      <section className="w-full bg-[#181818] py-14">
        <div className="text-center mb-2">
          <span className="text-orange-500 font-bold tracking-widest text-xs md:text-sm uppercase">Shop</span>
        </div>
        <h2 className="text-center text-white text-xl md:text-2xl font-bold mb-2">Our Latest Bicycles</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {latestBikes.length > 0 ? (
            latestBikes.map((bike) => (
              <ProductCard
                key={bike.id}
                product={bike}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={isInWishlist(bike.id)}
                cartLoading={cartLoading}
                stockMap={stockMap}
                userLoggedIn={userLoggedIn}
                isLatestBike={true}
              />
            ))
          ) : (
            <p className="text-center text-white col-span-full">Loading bikes...</p>
          )}
        </div>
      </section>

      {/* Other sections remain similar with updated ProductCard usage */}

      <ProductDetailsModal2
        showDetailsModal={showDetailsModal}
        viewProduct={viewProduct}
        setShowDetailsModal={setShowDetailsModal}
      />
    </div>
  );
}

export default HomePage;