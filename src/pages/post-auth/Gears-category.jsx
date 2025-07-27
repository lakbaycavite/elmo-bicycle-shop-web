import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProduct';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';

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

const GearIcon = () => (
    <i className="bi bi-gear"></i>
);

const HeartIcon = () => (
    <i className="bi bi-heart"></i>
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
    `}</style>
);

const GearCard = ({ gear, onAddToCart, onToggleWishlist, isInWishlist }) => (
    <div className="col">
        <div className="card h-100 shadow-sm" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <img src={gear.image || "/images/bikehelmet1.png"} className="card-img-top" style={{ borderBottom: `1px solid var(--border-color)` }} alt={gear.name} />
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title mb-1" style={{ color: 'var(--primary-accent)' }}>{gear.brand?.toUpperCase()} {gear.model}</h5>
                    <span 
                        style={{ color: 'var(--primary-accent)', opacity: isInWishlist ? 1 : 0.5, cursor: 'pointer' }}
                        onClick={() => onToggleWishlist(gear)}
                    >
                        <HeartIcon />
                    </span>
                </div>
                <p className="fw-bold mb-2">{gear.description || gear.name}</p>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Type: {gear.type || gear.name}</p>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        {gear.category && (
                            <span className="badge" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}>
                                {gear.category}
                            </span>
                        )}
                    </div>
                    <p className="fs-5 fw-bold mb-0" style={{ color: 'var(--primary-accent)' }}>
                        ₱{new Intl.NumberFormat().format(gear.price)}
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-add-to-cart w-100"
                        onClick={() => onAddToCart(gear)}
                    >
                        Add to Cart
                    </button>
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
        <GearIcon />
        <span>{category}</span>
      </label>
    </div>
  );
};

const GearListings = ({ gears, searchTerm, onSearchChange, onAddToCart, onToggleWishlist, wishlist }) => {
    const navigate = useNavigate(); 

    return (
        <main className="p-4" style={{ color: 'var(--text-primary)' }}>
            <h1 style={{ color: 'var(--primary-accent)' }}>Gears and Parts Listings</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Browse our newly released and high-quality gears and parts</p>
            <hr style={{ borderColor: 'var(--border-color)' }}/>
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
                            <button className="btn" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }} type="submit">
                                <i className="bi bi-search"></i>Search
                            </button>
                        </div>
                    </form>
                </div>
                <div className="col-md-4 col-lg-6 text-md-end mt-2 mt-md-0">
                    <button className="btn btn-secondary" type="button" onClick={() => navigate('/customer/accessories-category')}>
                        <i className="bi bi-tools"></i> Accessories
                    </button>
                </div>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {gears.length > 0 ? (
                    gears.map(gear => (
                        <GearCard 
                            key={gear.id} 
                            gear={gear} 
                            onAddToCart={onAddToCart}
                            onToggleWishlist={onToggleWishlist}
                            isInWishlist={wishlist.some(item => item.productId === gear.id)}
                        />
                    ))
                ) : (
                    <div className="col">
                        <p style={{ color: 'var(--text-secondary)' }}>No gears and parts match your criteria.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

const GearsCategory = () => {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Get products from your hook
    const { products } = useProducts();
    const { addToCart } = useCart();

    // Add wishlist hook
    const { wishlist, addItem, removeItem, refreshWishlist } = useWishlist(addToCart);

    // Filter products to only show gears and parts
    const gears = useMemo(() => {
        if (!products) return [];
        return products.filter(product =>
            product.category && (
                product.category.toLowerCase().includes('gears') ||
                product.category.toLowerCase().includes('parts') ||
                product.category.toLowerCase().includes('gear') ||
                product.category.toLowerCase().includes('part')
            )
        );
    }, [products]);

    // Load wishlist when component mounts
    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    const gearTypes = useMemo(() => {
        if (!gears.length) return [];
        // Extract unique gear types from the products
        const types = new Set();
        gears.forEach(gear => {
            if (gear.type) types.add(gear.type);
            if (gear.name) types.add(gear.name);
        });
        return Array.from(types);
    }, [gears]);

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category]
        );
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    const handleAddToCart = async (gear) => {
        try {
            await addToCart(gear.id, 1, gear);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handleToggleWishlist = async (gear) => {
        try {
            const isInWishlist = wishlist.some(item => item.productId === gear.id);
            if (isInWishlist) {
                const wishlistItem = wishlist.find(item => item.productId === gear.id);
                await removeItem(wishlistItem.id);
            } else {
                await addItem(gear);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const filteredGears = useMemo(() => {
        return gears.filter(gear => {
            const categoryMatch = selectedCategories.length === 0 || 
                selectedCategories.includes(gear.type) || 
                selectedCategories.includes(gear.name);
            const searchMatch = 
                (gear.name && gear.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (gear.description && gear.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (gear.brand && gear.brand.toLowerCase().includes(searchTerm.toLowerCase()));
            return categoryMatch && searchMatch;
        });
    }, [gears, selectedCategories, searchTerm]);

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
                                    <FilterCheckbox 
                                        key={gearType} 
                                        category={gearType} 
                                        isSelected={selectedCategories.includes(gearType)} 
                                        onToggle={toggleCategory} 
                                    />
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
                        onToggleWishlist={handleToggleWishlist}
                        wishlist={wishlist}
                    />
                </div>
            </div>
        </>
    );
};

export default GearsCategory; 