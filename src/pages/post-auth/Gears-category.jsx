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

const gearPartsCategories = [
  'Bottom Bracket',
  'Cassette',
  'Chainring',
  'Cranks',
  'Derailleur Hanger',
  'Electronic Shifters',
  'Freewheel',
  'Front Derailleur',
  'Gear Cables',
  'Gear Housing',
  'Gear Indicator Display',
  'Gear Levers',
  'Grip Shifter',
  'Internal Gear Hub',
  'Jockey Wheels',
  'Rear Derailleur',
  'Shifters',
  'Thumb Shifter',
  'Trigger Shifter'
];

const GearIcon = () => (
  <i className="bi bi-gear"></i>
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

const GearCard = ({ gear, onAddToCart, isInWishlist, onToggleWishlist, averageRating, totalRatings, handleShowDetailsModal, isAddingToCart }) => {
  const hasDiscount = Number(gear.discount) > 0;
  const discountedPrice = hasDiscount ? 
    Number(gear.price) * (1 - (Number(gear.discount) / 100)) : 
    Number(gear.price);
  const isOutOfStock = Number(gear.stock) <= 0;

  return (
    <div className="col">
      <div className="card h-100 shadow-sm position-relative" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
        {/* Discount badge */}
        {hasDiscount && (
          <div className="discount-badge">
            {gear.discount}% OFF
          </div>
        )}
        
        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="out-of-stock-badge">
            Out of Stock
          </div>
        )}
        
        <img src={gear.image || "/images/bikehelmet1.png"} className="card-img-top" style={{ borderBottom: `1px solid var(--border-color)` }} alt={gear.name} />
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-1" style={{ color: 'var(--primary-accent)' }}>{gear.name}</h5>
            <span
              className={`wishlist-heart ${isInWishlist ? 'active' : ''}`}
              style={{ color: isInWishlist ? 'var(--primary-accent)' : 'var(--text-secondary)', opacity: isInWishlist ? 1 : 0.5 }}
              onClick={() => onToggleWishlist(gear)}
            >
              <Heart fill={isInWishlist ? "currentColor" : "none"} />
            </span>
          </div>
          <p className="fw-bold mb-2">{gear.brand}</p>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Type: {gear.type}</p>
          <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Stock: {gear.stock}</p>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span className="badge" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}>{gear.category}</span>
            </div>
            <div className="text-end">
              {hasDiscount ? (
                <>
                  <span className="text-decoration-line-through me-2" style={{ color: 'var(--text-secondary)' }}>
                    ₱{new Intl.NumberFormat().format(gear.price)}
                  </span>
                  <span className="fs-5 fw-bold" style={{ color: 'var(--primary-accent)' }}>
                    ₱{new Intl.NumberFormat().format(discountedPrice)}
                  </span>
                </>
              ) : (
                <span className="fs-5 fw-bold" style={{ color: 'var(--primary-accent)' }}>
                  ₱{new Intl.NumberFormat().format(gear.price)}
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
              onClick={() => onAddToCart(gear)}
              disabled={isAddingToCart || isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="btn btn-details w-100" 
              onClick={() => handleShowDetailsModal(gear)}
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
        <GearIcon />
        <span>{category}</span>
      </label>
    </div>
  );
};

const GearListings = ({ 
  gears, 
  searchTerm, 
  onSearchChange, 
  onAddToCart, 
  wishlistItems, 
  onToggleWishlist, 
  ratingsMap, 
  selectedRatingFilter, 
  setSelectedRatingFilter, 
  handleShowDetailsModal,
  isAddingToCart,
  selectedCategoryFilter,
  setSelectedCategoryFilter
}) => {
  const navigate = useNavigate();

  const isInWishlist = (gearId) => {
    return wishlistItems.some(item => item.productId === gearId);
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
      <h1 style={{ color: 'var(--primary-accent)' }}>Gears and Parts Listings</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Browse our newly released and high-quality gears and parts</p>
      <hr style={{ borderColor: 'var(--border-color)' }} />
      <div className="row mb-4 align-items-center">
        <div className="col-md-8 col-lg-6">
          <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
            <input
              className="form-control me-2"
              style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              type="search"
              placeholder="Search gears and parts..."
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
          <button className="btn btn-secondary me-2" type="button" onClick={() => navigate('/customer/accessories-category')}><i className="bi bi-tools"></i>
            Accessories
          </button>
          <button className="btn btn-secondary me-2" type="button" onClick={() => navigate('/customer/bikes-category')}><i className="bi bi-bicycle"></i>
            Bikes
          </button>
        </div>
      </div>

      {/* Rating Filter Dropdown */}
      <div className="d-flex align-items-center mb-3">
        <div className="d-flex align-items-center" style={{ width: '330px' }}>
          <label
            htmlFor="ratingFilter"
            className="form-label me-2 mb-0"
            style={{ color: 'var(--text-primary)' }}
          >
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

        <label
          htmlFor="categoryFilter"
          className="form-label me-2 mb-0"
          style={{ color: 'var(--text-primary)' }}
        >
        </label>
        <select
          id="categoryFilter"
          className="form-select"
          style={{
            backgroundColor: 'var(--card-background)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border-color)',
            maxWidth: '200px'
          }}
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
        >
          <option value="all">Gears & Parts</option>
          <option value="gears">Gears</option>
          <option value="parts">Parts</option>
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {gears.length > 0 ? (
          gears.map(gear => {
            // Get ratings for this gear
            const gearRatings = ratingsMap[gear.id] || {};
            const ratingsArray = Object.values(gearRatings);

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
              <GearCard
                key={gear.id}
                gear={gear}
                averageRating={averageRating}
                totalRatings={totalRatings}
                onAddToCart={onAddToCart}
                isInWishlist={isInWishlist(gear.id)}
                onToggleWishlist={onToggleWishlist}
                handleShowDetailsModal={handleShowDetailsModal}
                isAddingToCart={isAddingToCart}
              />
            );
          })
        ) : (
          <div className="col">
            <p style={{ color: 'var(--text-secondary)' }}>No gears and parts match your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}

const GearsCategory = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [ratingsMap, setRatingsMap] = useState({});
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
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

  const gears = useMemo(() => {
    if (!products) return [];
    return products.filter(product =>
      product.category && (
        product.category.toLowerCase().includes('gears') ||
        product.category.toLowerCase().includes('parts') ||
        product.category.toLowerCase().includes('gear') ||
        product.category.toLowerCase().includes('part') ||
        gearPartsCategories.some(category =>
          product.type?.toLowerCase().includes(category.toLowerCase()) ||
          product.name?.toLowerCase().includes(category.toLowerCase()) ||
          product.category?.toLowerCase().includes(category.toLowerCase())
        )
      )
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

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const gearTypes = useMemo(() => {
    if (!gears.length) return [];
    const types = new Set();
    gears.forEach(gear => {
      if (gear.type) types.add(gear.type);
    });
    return Array.from(types);
  }, [gears]);

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

  const filteredGears = useMemo(() => {
    return gears.filter(gear => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(gear.type);
      const searchMatch =
        (gear.name && gear.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (gear.brand && gear.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      let ratingMatch = true;
      if (selectedRatingFilter !== 'all') {
        const gearRatings = ratingsMap[gear.id] || {};
        const ratingsArray = Object.values(gearRatings);

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

      const categoryMatch = selectedCategoryFilter === 'all' ||
        (selectedCategoryFilter === 'gears' && gear.category.toLowerCase().includes('gear')) ||
        (selectedCategoryFilter === 'parts' && gear.category.toLowerCase().includes('part'));

      return typeMatch && searchMatch && ratingMatch && categoryMatch;
    });
  }, [gears, selectedTypes, searchTerm, selectedRatingFilter, ratingsMap, selectedCategoryFilter]);

  const handleAddToCart = async (gear) => {
  if (isAddingToCart || Number(gear.stock) <= 0) return;

  // Check if bike is already in cart
  const isAlreadyInCart = cart.some(item => item.productId === gear.id);
  if (isAlreadyInCart) {
    toast.info(`${gear.name} is already in your cart.`);
    return; // Stop here, don’t add again
  }

  setIsAddingToCart(true);
  try {
    await addToCart(gear.id, 1, {
      ...gear,
      quantity: 1,
    });
    toast.success(`${gear.name} added to cart!`);
  } catch (error) {
    toast.error(`Error adding to cart: ${error.message}`);
  } finally {
    setIsAddingToCart(false);
  }
};


 const handleToggleWishlist = async (gear) => {
  const auth = getAuth();
  const user = auth.currentUser; // check if logged in

  if (!user) {
    toast.error("Please log in to use the wishlist!"); 
    console.error("Wishlist clicked by non-logged user.");
    return;
  }

  try {
    const inWishlist = wishlist.some(item => item.productId === gear.id);

    if (inWishlist) {
      const wishlistItem = wishlist.find(item => item.productId === gear.id);
      if (wishlistItem) {
        await removeItem(wishlistItem.id);
        toast.success(`${gear.brand} ${gear.name} removed from wishlist!`);
      }
    } else {
      await addItem({
        id: gear.id,
        name: gear.name,
        price: gear.price,
        image: gear.image || "/images/bikehelmet1.png",
        category: gear.category,
        brand: gear.brand,
        type: gear.type,
        description: gear.description || ""
      });
      toast.success(`${gear.brand} ${gear.name} added to wishlist!`);
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
                {gearTypes.map(gearType => (
                  <FilterCheckbox key={gearType} category={gearType} isSelected={selectedTypes.includes(gearType)} onToggle={toggleType} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginLeft: isSidebarCollapsed ? '100px' : '280px', transition: 'margin-left 0.3s ease' }}>
          <GearListings
            gears={filteredGears}
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
            selectedCategoryFilter={selectedCategoryFilter}
            setSelectedCategoryFilter={setSelectedCategoryFilter}
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

export default GearsCategory;