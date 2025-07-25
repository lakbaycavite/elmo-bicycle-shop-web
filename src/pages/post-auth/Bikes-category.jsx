import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist'; // Import the wishlist hook
import { Heart } from 'lucide-react';
import { toast } from 'sonner';


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


const BikeIcon = () => (
  <i className="bi bi-bicycle"></i>
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
        .btn-details { background-color: var(--secondary-button); border-color: var(--secondary-button); color: var(--text-primary); }
        .wishlist-heart { cursor: pointer; transition: all 0.2s ease; }
        .wishlist-heart:hover { transform: scale(1.1); }
        .wishlist-heart.active { color: var(--primary-accent); opacity: 1; }
    `}</style>
);




const BikeCard = ({ bike, onAddToCart, isInWishlist, onToggleWishlist }) => (
  <div className="col">
    <div className="card h-100 shadow-sm" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
      <img src={bike.image || "/images/bike.png"} className="card-img-top" style={{ borderBottom: `1px solid var(--border-color)` }} alt={bike.name} />
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title mb-1" style={{ color: 'var(--primary-accent)' }}>{bike.name}</h5>
          <span
            className={`wishlist-heart ${isInWishlist ? 'active' : ''}`}
            style={{ color: isInWishlist ? 'var(--primary-accent)' : 'var(--text-secondary)', opacity: isInWishlist ? 1 : 0.5 }}
            onClick={() => onToggleWishlist(bike)}
          >
            <Heart fill={isInWishlist ? "currentColor" : "none"} />
          </span>
        </div>
        <p className="fw-bold mb-2">{bike.brand}</p>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Type: {bike.type}</p>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span className="badge" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}>{bike.category}</span>
          </div>
          <p className="fs-5 fw-bold mb-0" style={{ color: 'var(--primary-accent)' }}>
            ₱{new Intl.NumberFormat().format(bike.price)}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-add-to-cart w-100" onClick={() => onAddToCart(bike)}>Add to Cart</button>
          <button className="btn btn-details w-100">Details</button>
        </div>
      </div>
    </div>
  </div>
);


const FilterCheckbox = ({ category, isSelected, onToggle }) => {
  const id = `btn-check-${category.replace(/\s+/g, '-')}`;
  return (
    <div>
      <input type="checkbox" className="btn-check" id={id} checked={isSelected} onChange={() => onToggle(category)} autoComplete="off" />
      <label className="btn btn-sm d-flex align-items-center filter-btn" htmlFor={id}>
        <BikeIcon />
        <span>{category}</span>
      </label>
    </div>
  );
};

const BikeListings = ({ bikes, searchTerm, onSearchChange, onAddToCart, wishlistItems, onToggleWishlist }) => {
  const navigate = useNavigate();

  // Helper function to check if a bike is in wishlist
  const isInWishlist = (bikeId) => {
    return wishlistItems.some(item => item.productId === bikeId);
  };

  return (
    <main className="p-4" style={{ color: 'var(--text-primary)' }}>
      <h1 style={{ color: 'var(--primary-accent)' }}>Bike Listings</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Browse our newly released and high-quality bikes</p>
      <hr style={{ borderColor: 'var(--border-color)' }} />
      <div className="row mb-4 align-items-center">
        <div className="col-md-8 col-lg-6">
          <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
            <input
              className="form-control me-2"
              style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              type="search"
              placeholder="Search bikes..."
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
            <Heart size={16} className="me-1" /> My Wishlist
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/customer/accessories-category')}><i className="bi bi-tools"></i>
            Accessories
          </button>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {bikes.length > 0 ? (
          bikes.map(bike => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onAddToCart={onAddToCart}
              isInWishlist={isInWishlist(bike.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))
        ) : (
          <div className="col">
            <p style={{ color: 'var(--text-secondary)' }}>No bikes match your criteria.</p>
          </div>
        )}
      </div>
    </main>
  );
}



const BikesCategory = () => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get products from your hook
  const { products } = useProducts();
  const { addToCart } = useCart();

  // Add wishlist hook
  const { wishlist, addItem, removeItem, refreshWishlist } = useWishlist(addToCart);

  // Filter products to only show bikes
  const bikes = useMemo(() => {
    if (!products) return [];
    return products.filter(product =>
      product.category && product.category.includes('Bikes')
    );
  }, [products]);

  // Load wishlist when component mounts
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const bikeTypes = useMemo(() => {
    if (!bikes.length) return [];
    // Extract unique bike types from the products
    const types = new Set();
    bikes.forEach(bike => {
      if (bike.type) types.add(bike.type);
    });

    return Array.from(types);
  }, [bikes]);

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

  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(bike.type);
      const searchMatch =
        (bike.name && bike.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        // (bike.description && bike.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bike.brand && bike.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      // (bike.model && bike.model.toLowerCase().includes(searchTerm.toLowerCase()));
      return typeMatch && searchMatch;
    });
  }, [bikes, selectedTypes, searchTerm]);

  const handleAddToCart = async (bike) => {
    try {
      // Add product to cart with quantity 1
      await addToCart(bike.id, 1, {
        ...bike, // Spread the bike details
      })

      // Show success message
    } catch (error) {
      toast.error(`Error adding to cart: ${error.message}`);
    }
  };

  // Handle toggling wishlist
  const handleToggleWishlist = async (bike) => {
    try {
      // Check if product is already in wishlist
      const inWishlist = wishlist.some(item => item.productId === bike.id);

      if (inWishlist) {
        // Find the wishlist item id and remove it
        const wishlistItem = wishlist.find(item => item.productId === bike.id);
        if (wishlistItem) {
          await removeItem(wishlistItem.id)
            .then(() => {
              toast.success(`${bike.brand} ${bike.name} removed from wishlist!`);
            })
        }
      } else {
        // Add the product to wishlist
        await addItem({
          id: bike.id,
          name: bike.name,
          price: bike.price,
          image: bike.image || "/images/bike.png",
          category: bike.category,
          brand: bike.brand,
          type: bike.type,
          description: bike.description || ""
        })
          .then(() => {
            toast.success(`${bike.brand} ${bike.name} added to wishlist!`);
          })
      }

      // Refresh wishlist after changes
      refreshWishlist();
    } catch (error) {
      console.error("Error updating wishlist:", error);
      window.alert(`Error updating wishlist: ${error.message}`);
    }
  };

  return (
    <>
      <ThemeStyles />
      <div style={{ backgroundColor: 'var(--background-main)' }} className="min-vh-100">
        <div
          className={`d-flex flex-column flex-shrink-0 p-3 vh-100 position-fixed ${isSidebarCollapsed ? 'collapsed-sidebar' : ''}`}
          style={{
            width: isSidebarCollapsed ? '75px' : '280px', // Increased collapsed width
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
                {bikeTypes.map(bikeType => (
                  <FilterCheckbox key={bikeType} category={bikeType} isSelected={selectedTypes.includes(bikeType)} onToggle={toggleType} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginLeft: isSidebarCollapsed ? '100px' : '280px', transition: 'margin-left 0.3s ease' }}>
          <BikeListings
            bikes={filteredBikes}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddToCart={handleAddToCart}
            wishlistItems={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>
      </div>
    </>
  );
};

export default BikesCategory;