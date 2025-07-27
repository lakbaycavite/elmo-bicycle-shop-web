import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

const accessoriesNames = [
    'Helmet', 'Bike Lock', 'Lights (Front/Rear)', 'Bell or Horn', 'Water Bottle', 'Water Bottle Cage', 'Bike Pump',
        'Saddle Bag', 'Phone Mount', 'Bike Computer', 'Mirror', 'Kickstand', 'Mudguards/Fenders', 'Panniers',
        'Handlebar Grips/Tape', 'Chain Lube', 'Multi-tool', 'Tire Levers', 'Spare Tube', 'Patch Kit', 'Cycling Gloves',
        'Cycling Glasses', 'Bike Rack (for car or storage)', 'Frame Bag', 'Bike Cover'
];


const bikes = accessoriesNames.map((name, index) => {
    const isRoadBike = name === "Road Bike";
    return {
        id: index + 1,
        name: name,
        brand: isRoadBike ? "Foxter" : "Helmet",
        model: isRoadBike ? "R10" : `X${index + 1}`,
        description: isRoadBike ? "Twitter Road Bike" : `High-quality ${name}`,
        price: isRoadBike ? 39900 : 20000 + (index * 1500),
        tags: ["Accessories"],
        image: `/images/bikehelmet1.png`
    };
});

const accessoriesTypes = bikes.map(bike => bike.name);



const BikeIcon = () => (
    <i class="bi bi-tools"></i>
);

const HeartIcon = () => (
    <i class="bi bi-heart"></i>
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




const BikeCard = ({ bike }) => (
    <div className="col">
        <div className="card h-100 shadow-sm" style={{ backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
            <img src={bike.image || "/images/bike.png"} className="card-img-top" style={{ borderBottom: `1px solid var(--border-color)` }} alt={bike.name} />
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title mb-1" style={{ color: 'var(--primary-accent)' }}>{bike.brand.toUpperCase()} {bike.model}</h5>
                    <span style={{ color: 'var(--primary-accent)', opacity: 0.5 }}><HeartIcon /></span>
                </div>
                <p className="fw-bold mb-2">{bike.description}</p>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Type: {bike.name}</p>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        {bike.tags.map(tag => (
                            <span key={tag} className="badge" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }}>{tag}</span>
                        ))}
                    </div>
                    <p className="fs-5 fw-bold mb-0" style={{ color: 'var(--primary-accent)' }}>
                        ₱{new Intl.NumberFormat().format(bike.price)}
                    </p>
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-add-to-cart w-100">Add to Cart</button>
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

const Sidebar = ({ selectedCategories, onToggleCategory }) => (
  <aside className="d-flex flex-column flex-shrink-0 p-3 vh-100 position-fixed" style={{ width: '280px', backgroundColor: 'var(--background-sidebar)', color: 'var(--text-primary)' }}>
    <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none" style={{ color: 'var(--text-primary)' }}>
      <img src="/images/logos/elmo.png" alt="Elmo Logo" style={{ height: '40px', marginRight: '10px', maxWidth: '100%', objectFit: 'contain' }} />
      <span className="fs-4" style={{ color: 'var(--primary-accent)' }}>Bike Category</span>
    </a>
    <hr style={{ borderColor: 'var(--border-color)' }} />
    <h3 className="fs-5 mb-3">Filter by Type</h3>
    <div className="d-flex flex-wrap gap-2">
      {accessoriesTypes.map(bikeType => (
        <FilterCheckbox key={bikeType} category={bikeType} isSelected={selectedCategories.includes(bikeType)} onToggle={onToggleCategory} />
      ))}
    </div>
  </aside>
);

const BikeListings = ({ bikes, searchTerm, onSearchChange }) => {
    const navigate = useNavigate(); 
return (
  
  <main className="p-4" style={{ color: 'var(--text-primary)' }}>
    {/* Back button */}
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
    
    <h1 style={{ color: 'var(--primary-accent)' }}>Accessories Listings</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Browse our newly released and high-quality accessories</p>
    <hr style={{ borderColor: 'var(--border-color)' }}/>
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
          <button className="btn" style={{ backgroundColor: 'var(--primary-accent)', color: 'var(--text-primary)' }} type="submit"><i class="bi bi-search"></i>Search</button>
        </div>
        </form>
      </div>
      <div className="col-md-4 col-lg-6 text-md-end mt-2 mt-md-0">
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/customer/bikes-category')}><i class="bi bi-bicycle"></i>
            Bikes
          </button>
      </div>
    </div>
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {bikes.length > 0 ? (
        bikes.map(bike => <BikeCard key={bike.id} bike={bike} />)
      ) : (
        <div className="col">
          <p style={{ color: 'var(--text-secondary)' }}>No bikes match your criteria.</p>
        </div>
      )}
    </div>
  </main>
);
}



const AccessoriesCategory = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


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

  const filteredBikes = useMemo(() => {
    return bikes.filter(bike => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(bike.name);
      const searchMatch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bike.description.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [selectedCategories, searchTerm]);

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
                {accessoriesTypes.map(bikeType => (
                  <FilterCheckbox key={bikeType} category={bikeType} isSelected={selectedCategories.includes(bikeType)} onToggle={toggleCategory} />
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginLeft: isSidebarCollapsed ? '100px' : '280px', transition: 'margin-left 0.3s ease' }}>
          <BikeListings bikes={filteredBikes} searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        </div>
      </div>
    </>
  );
};

export default AccessoriesCategory;