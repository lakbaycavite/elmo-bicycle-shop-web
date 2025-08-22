import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { onValue, ref } from 'firebase/database';
import { database } from '../../firebase/firebase';
import ProductDetailsModal from '../../components/ProductsDetailsModal';
import { getAuth } from "firebase/auth";

const theme = {
  primaryAccent: '#ff8c00',
  secondaryButton: '#6c757d',
  backgroundMain: '#1a1a1a',
  backgroundSidebar: '#000000',
  cardBackground: '#242424',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  borderColor: '#444444',
};

const AccessoryIcon = () => (
  <i className="bi bi-tools"></i>
);

const ThemeStyles = () => (
  <style>{`
    :root {
      --primary-accent: ${theme.primaryAccent};
      --secondary-button: ${theme.secondaryButton};
      --background-main: ${theme.backgroundMain};
      --background-sidebar: ${theme.backgroundSidebar};
      --card-background: ${theme.cardBackground};
      --text-primary: ${theme.textPrimary};
      --text-secondary: ${theme.textSecondary};
      --border-color: ${theme.borderColor};
    }
    .filter-btn { color: var(--primary-accent); border-color: var(--primary-accent); }
    .filter-btn:hover { color: var(--text-primary); background-color: var(--primary-accent); border-color: var(--primary-accent); }
    .btn-check:checked + .filter-btn { color: var(--text-primary); background-color: var(--primary-accent); border-color: var(--primary-accent); }
    .btn-add-to-cart { background-color: var(--primary-accent); border-color: var(--primary-accent); color: var(--text-primary); }
    .btn-add-to-cart:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-details { background-color: var(--secondary-button); border-color: var(--secondary-button); color: var(--text-primary); }
    .wishlist-heart { cursor: pointer; transition: all 0.2s ease; }
    .wishlist-heart:hover { transform: scale(1.1); }
    .wishlist-heart.active { color: var(--primary-accent); opacity: 1; }
    .discount-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: var(--primary-accent);
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .out-of-stock-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background-color: #dc3545;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }
  `}</style>
);

const AccessoryCard = ({ accessory, onAddToCart, isInWishlist, onToggleWishlist, averageRating, totalRatings, handleShowDetailsModal, isAddingToCart }) => {
  const hasDiscount = Number(accessory.discount) > 0;
  const discountedPrice = hasDiscount ? 
    Number(accessory.price) * (1 - (Number(accessory.discount) / 100)) : 
    Number(accessory.price);
  const isOutOfStock = Number(accessory.stock) <= 0;

  return (
    <div className="col">
      <div className="card h-100 shadow-sm position-relative" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
        {/* Discount badge */}
        {hasDiscount && (
          <div className="discount-badge">
            {accessory.discount}% OFF
          </div>
        )}
        
        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="out-of-stock-badge">
            Out of Stock
          </div>
        )}
        
        <img src={accessory.image || "/images/accessory.png"} className="card-img-top" style={{ borderBottom: `1px solid var(--border-color)` }} alt={accessory.name} />
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-1" style={{ color: 'var(--primary-accent)' }}>{accessory.name}</h5>
            <span
              className={`wishlist-heart ${isInWishlist ? 'active' : ''}`}
              style={{ color: isInWishlist ? 'var(--primary-accent)' : 'var(--text-secondary)', opacity: isInWishlist ? 1 : 0.5 }}
              onClick={() => onToggleWishlist(accessory)}
            >
              <Heart fill={isInWishlist ? "currentColor" : "none"} />
            </span>
          </div>
          <p className="fw-bold mb-2">{accessory.brand}</p>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Type: {accessory.type}</p>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Stock: {accessory.stock}</p>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="badge" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}>{accessory.category}</span>
            </div>
            <div className="text-end">
              {hasDiscount ? (
                <>
                  <span className="text-decoration-line-through me-2" style={{ color: 'var(--text-secondary)' }}>
                    ₱{new Intl.NumberFormat().format(accessory.price)}
                  </span>
                  <span className="fs-5 fw-bold" style={{ color: 'var(--primary-accent)' }}>
                    ₱{new Intl.NumberFormat().format(discountedPrice)}
                  </span>
                </>
              ) : (
                <span className="fs-5 fw-bold" style={{ color: 'var(--primary-accent)' }}>
                  ₱{new Intl.NumberFormat().format(accessory.price)}
                </span>
              )}
            </div>
          </div>

          {/* Ratings display */}
          {averageRating && totalRatings > 0 ? (
            <div className="mb-2">
              <span style={{ color: 'gold' }}>★ {averageRating}</span>
              <small className="ms-1" style={{ color: 'var(--text-secondary)' }}>({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</small>
            </div>
          ) : (
            <div className="mb-2" style={{ color: 'var(--text-secondary)' }}>No ratings yet</div>
          )}

          <div className="d-flex gap-2">
            <button 
              className="btn btn-add-to-cart w-100" 
              onClick={() => onAddToCart(accessory)}
              disabled={isAddingToCart || isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="btn btn-details w-100" 
              onClick={() => handleShowDetailsModal(accessory)}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterCheckbox = ({ category, isSelected, onToggle }) => {
  const id = `btn-check-${category.replace(/\s+/g, '-')}`;
  return (
    <div>
      <input type="checkbox" className="btn-check" id={id} checked={isSelected} onChange={() => onToggle(category)} autoComplete="off" />
      <label className="btn btn-sm d-flex align-items-center filter-btn" htmlFor={id}>
        <AccessoryIcon />
        <span>{category}</span>
      </label>
    </div>
  );
};

const AccessoryListings = ({ 
  accessories, 
  searchTerm, 
  onSearchChange, 
  onAddToCart, 
  wishlistItems, 
  onToggleWishlist, 
  ratingsMap, 
  selectedRatingFilter, 
  setSelectedRatingFilter, 
  handleShowDetailsModal,
  isAddingToCart 
}) => {
  const navigate = useNavigate();

  const isInWishlist = (accessoryId) => {
    return wishlistItems.some(item => item.productId === accessoryId);
  };

  return (
    <main className="p-4" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => navigate('/customer/home')}
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <i className="bi bi-arrow-left"></i>
          Back to Home
        </button>
      </div>
      <h1 style={{ color: 'var(--primary-accent)' }}>Accessory Listings</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Browse our high-quality bike accessories</p>
      <hr style={{ borderColor: 'var(--border-color)' }} />
      <div className="row mb-4 align-items-center">
        <div className="col-md-8 col-lg-6">
          <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
            <input
              className="form-control me-2"
              style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              type="search"
              placeholder="Search accessories..."
              value={searchTerm}
              onChange={onSearchChange}
            />
            <div className="col-md-4 col-lg-6 text-md-start mt-2 mt-md-0">
              <button className="btn" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }} type="submit"><i className="bi bi-search"></i>Search</button>
            </div>
          </form>
        </div>
        <div className="col-md-4 col-lg-6 text-md-end mt-2 mt-md-0">
          <button
            className="btn me-2"
            style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}
            onClick={() => navigate('/customer/wishlist')}
          >
            <i className="bi bi-heart-fill"></i>My Wishlist
          </button>
          <button className="btn btn-secondary me-2" type="button" onClick={() => navigate('/customer/bikes-category')}><i className="bi bi-bicycle"></i>
            Bikes
          </button>
          <button className="btn btn-secondary me-2" type="button" onClick={() => navigate('/customer/gears-parts-category')}><i className="bi bi-gear"></i>
            Gears & Parts
          </button>
        </div>
      </div>

      {/* Rating Filter Dropdown */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label htmlFor="ratingFilter" className="form-label me-2 mb-0" style={{ color: 'var(--text-primary)' }}>
              Filter by Rating:
            </label>
            <select
              id="ratingFilter"
              className="form-select"
              style={{
                backgroundColor: 'var(--card-background)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                maxWidth: '200px'
              }}
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars & Above</option>
              <option value="4">4 Stars & Above</option>
              <option value="3">3 Stars & Above</option>
              <option value="2">2 Stars & Above</option>
              <option value="1">1 Star & Above</option>
            </select>
          </div>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {accessories.length > 0 ? (
          accessories.map(accessory => {
            // Get ratings for this accessory
            const accessoryRatings = ratingsMap[accessory.id] || {};
            const ratingsArray = Object.values(accessoryRatings);

            // Calculate average rating
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
              <AccessoryCard
                key={accessory.id}
                accessory={accessory}
                averageRating={averageRating}
                totalRatings={totalRatings}
                onAddToCart={onAddToCart}
                isInWishlist={isInWishlist(accessory.id)}
                onToggleWishlist={onToggleWishlist}
                handleShowDetailsModal={handleShowDetailsModal}
                isAddingToCart={isAddingToCart}
              />
            );
          })
        ) : (
          <div className="col">
            <p style={{ color: 'var(--text-secondary)' }}>No accessories match your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}

const AccessoriesCategory = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ratingsMap, setRatingsMap] = useState({});
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const location = useLocation();

  const { products, getProduct } = useProducts();
  const { cart,addToCart } = useCart();
  const { wishlist, addItem, removeItem, refreshWishlist } = useWishlist();

  const handleShowDetailsModal = async (product) => {
    if (!product) {
      console.error("No product data provided for details modal");
      return;
    }
    await getProduct(product.id)
      .then(() => {
        setViewProduct(product);
        setShowDetailsModal(true);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        toast.error(`Failed to load product details`);
      });
  };

  useEffect(() => {
    if (location.state) {
      if (location.state.ratingFilter) {
        setSelectedRatingFilter(location.state.ratingFilter);
      }

      if (location.state.handleShowDetailsModal && products) {
        const product = products.find(p => p.id === location.state.handleShowDetailsModal);
        if (product) {
          handleShowDetailsModal(product);
        }
      }
    }
  }, [location.state, products]);

  const accessories = useMemo(() => {
    if (!products) return [];
    return products.filter(product =>
      product.category && product.category.includes('Accessories')
    );
  }, [products]);

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

    return () => {
      unsubscribe();
    };
  }, []);

  const accessoryTypes = useMemo(() => {
    if (!accessories.length) return [];
    const types = new Set();
    accessories.forEach(accessory => {
      if (accessory.type) types.add(accessory.type);
    });
    return Array.from(types);
  }, [accessories]);

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const filteredAccessories = useMemo(() => {
    return accessories.filter(accessory => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(accessory.type);
      const searchMatch =
        (accessory.name && accessory.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (accessory.brand && accessory.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      let ratingMatch = true;
      if (selectedRatingFilter !== 'all') {
        const accessoryRatings = ratingsMap[accessory.id] || {};
        const ratingsArray = Object.values(accessoryRatings);

        if (ratingsArray.length > 0) {
          const validRatings = ratingsArray.filter(rating =>
            rating && rating.rating && !isNaN(Number(rating.rating))
          );

          if (validRatings.length > 0) {
            const sum = validRatings.reduce((total, rating) => total + Number(rating.rating), 0);
            const averageRating = sum / validRatings.length;
            const filterValue = parseInt(selectedRatingFilter);
            ratingMatch = Math.floor(averageRating) >= filterValue;
          } else {
            ratingMatch = false;
          }
        } else {
          ratingMatch = false;
        }
      }

      return typeMatch && searchMatch && ratingMatch;
    });
  }, [accessories, selectedTypes, searchTerm, selectedRatingFilter, ratingsMap]);

  const handleAddToCart = async (accessory) => {
  if (isAddingToCart || Number(accessory.stock) <= 0) return;

  // Check if bike is already in cart
  const isAlreadyInCart = cart.some(item => item.productId === accessory.id);
  if (isAlreadyInCart) {
    toast.info(`${accessory.name} is already in your cart.`);
    return; // Stop here, don’t add again
  }

  setIsAddingToCart(true);
  try {
    await addToCart(accessory.id, 1, {
      ...accessory,
      quantity: 1,
    });
    toast.success(`${accessory.name} added to cart!`);
  } catch (error) {
    toast.error(`Error adding to cart: ${error.message}`);
  } finally {
    setIsAddingToCart(false);
  }
};


const handleToggleWishlist = async (accessory) => {
  const auth = getAuth();
  const user = auth.currentUser; // check if logged in

  if (!user) {
    toast.error("Please log in to use the wishlist!"); 
    console.error("Wishlist clicked by non-logged user.");
    return;
  }

  try {
    const inWishlist = wishlist.some(item => item.productId === accessory.id);

    if (inWishlist) {
      const wishlistItem = wishlist.find(item => item.productId === accessory.id);
      if (wishlistItem) {
        await removeItem(wishlistItem.id);
        toast.success(`${accessory.brand} ${accessory.name} removed from wishlist!`);
      }
    } else {
      await addItem({
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        image: accessory.image || "/images/bike.png",
        category: accessory.category,
        brand: accessory.brand,
        type: accessory.type,
        description: accessory.description || ""
      });
      toast.success(`${accessory.brand} ${accessory.name} added to wishlist!`);
    }

    refreshWishlist();
  } catch (error) {
    console.error("Error updating wishlist:", error);
    toast.error(`Error updating wishlist: ${error.message}`);
  }
};

  return (
    <>
      <ThemeStyles />
      <div style={{ backgroundColor: 'var(--background-main)' }} className="min-vh-100">
        <div
          className={`d-flex flex-column flex-shrink-0 p-3 vh-100 position-fixed ${isSidebarCollapsed ? 'collapsed-sidebar' : ''}`}
          style={{
            width: isSidebarCollapsed ? '75px' : '280px',
            backgroundColor: 'var(--background-sidebar)',
            color: 'var(--text-primary)',
            transition: 'width 0.3s ease',
          }}
        >
          <div className="d-flex align-items-center mb-3">
            <div
              className="burger-icon"
              onClick={toggleSidebar}
              style={{
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: 'var(--text-primary)',
                padding: '0 10px',
              }}
            >
              ☰
            </div>
            {!isSidebarCollapsed && (
              <a
                href="/"
                className="d-flex align-items-center text-decoration-none"
                style={{
                  color: 'var(--text-primary)',
                  flexGrow: 1,
                }}
              >
                <img
                  src="/images/logos/elmo.png"
                  alt="Elmo Logo"
                  style={{
                    height: '40px',
                    marginRight: '10px',
                    maxWidth: '100%',
                    objectFit: 'contain',
                  }}
                />
              </a>
            )}
          </div>
          {!isSidebarCollapsed && (
            <>
              <hr style={{ borderColor: 'var(--border-color)' }} />
              <h3 className="fs-5 mb-3">Filter by Type</h3>
              <div className="d-flex flex-wrap gap-2">
                {accessoryTypes.map(accessoryType => (
                  <FilterCheckbox key={accessoryType} category={accessoryType} isSelected={selectedTypes.includes(accessoryType)} onToggle={toggleType} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginLeft: isSidebarCollapsed ? '100px' : '280px', transition: 'margin-left 0.3s ease' }}>
          <AccessoryListings
            accessories={filteredAccessories}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddToCart={handleAddToCart}
            wishlistItems={wishlist}
            onToggleWishlist={handleToggleWishlist}
            ratingsMap={ratingsMap}
            selectedRatingFilter={selectedRatingFilter}
            setSelectedRatingFilter={setSelectedRatingFilter}
            handleShowDetailsModal={handleShowDetailsModal}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
      <ProductDetailsModal
        viewProduct={viewProduct}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        formatPrice={(price) => `₱${new Intl.NumberFormat().format(price)}`}
      />
    </>
  );
};

export default AccessoriesCategory;