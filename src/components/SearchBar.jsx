import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../hooks/useProduct';
function SearchBar({ className = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { products } = useProducts();
  const searchRef = useRef(null);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([]);
      setIsDropdownOpen(false);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limit to 5 results for better UX

    setFilteredProducts(filtered);
    setIsDropdownOpen(filtered.length > 0);
  }, [searchTerm, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductSelect = (product) => {
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
    // You can add navigation logic here if needed
    // For example: navigate(`/products/${product.id}`);
  };

  return (
    <div className={`relative w-full max-w-md ${className}`} ref={searchRef}>
      <input
        type="text"
        placeholder="Search products..."
        className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-600 bg-neutral-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-all"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => searchTerm.trim() !== '' && setIsDropdownOpen(filteredProducts.length > 0)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
      </span>

      {/* Dropdown with search results */}
      {isDropdownOpen && (
        <div className="absolute z-20 mt-2 w-full bg-neutral-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="px-4 py-3 hover:bg-neutral-700 cursor-pointer flex items-center gap-3 transition-colors"
              onClick={() => handleProductSelect(product)}
            >
              {/* Product image thumbnail */}
              <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-neutral-900 border border-gray-700">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40'; // Fallback image
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-orange-500 font-semibold">
                  </span>
                  {product.discountedFinalPrice > 0 ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        ₱{(product.discountedFinalPrice / (1 - product.discount / 100)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-orange-400">
                        ₱{(Number(product.discountedFinalPrice)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="ml-1 bg-orange-600 text-xs text-white px-1.5 py-0.5 rounded">
                        {product.discount}% off
                      </span>
                    </>
                  ) : (
                    <>
                      ₱{product.price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && searchTerm.trim() !== '' && (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No products found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;