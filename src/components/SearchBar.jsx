import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { X } from "lucide-react";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const navigate = useNavigate();
  const db = getDatabase();

  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.entries(data).map(([id, product]) => ({
          id,
          ...product,
        }));
        setAllProducts(productsArray);
      }
    });
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const results = allProducts.filter((product) => {
      const nameMatch = product.name?.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = product.category?.toLowerCase().includes(query.toLowerCase());
      return nameMatch || categoryMatch;
    });

    setFilteredProducts(results);
  }, [query, allProducts]);

const handleProductSelect = (product) => {
  if (!product || !product.category) return;

  let categoryPath = "";
  const category = product.category.toLowerCase();

  if (category === "bikes") {
    categoryPath = "bikes-category";
  } else if (category === "accessories") {
    categoryPath = "accessories-category";
  } else if (["gears", "parts"].includes(category)) {
    categoryPath = "gears-category";
  } else {
    console.warn("Unknown category:", category);
    return;
  }

  navigate(`/customer/${categoryPath}/${product.id}`);
  setQuery("");
  setFilteredProducts([]);
  setIsMobileModalOpen(false);
};


  const renderSearchResults = () => (
    <div className="absolute z-20 bg-black shadow-lg mt-2 max-h-60 w-full overflow-y-auto rounded border">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 px-4 py-2 cursor-pointer "
            onClick={() => handleProductSelect(product)}
          >
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              className="w-10 h-10 object-cover rounded"
            />
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="px-4 py-2 text-gray-500">No matching results</div>
      )}
    </div>
  );

  const SearchInput = (
   <div className="flex justify-center">
  <div className="relative w-99">
    <input
      type="text"
      placeholder="Search by name or category..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none"
    />
    {filteredProducts.length > 0 && renderSearchResults()}
  </div>
</div>

  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block w-full">{SearchInput}</div>

      {/* Mobile View - Modal Trigger */}
      <div className="block md:hidden w-full">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none"
          onFocus={() => setIsMobileModalOpen(true)}
        />
      </div>

      {/* Mobile Modal */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Search</h2>
            <button onClick={() => setIsMobileModalOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Search Bar Inside Modal */}
          <input
            type="text"
            placeholder="Search by name or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded shadow-sm focus:outline-none mb-4"
          />

          {/* Modal Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer "
                  onClick={() => handleProductSelect(product)}
                >
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No matching results</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBar;
