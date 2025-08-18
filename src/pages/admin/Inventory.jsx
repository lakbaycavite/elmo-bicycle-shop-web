import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useProducts } from '../../hooks/useProduct';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { useUsers } from '../../hooks/useUser';
import { toast } from 'sonner';
import ProductDetailsModal from '../../components/ProductsDetailsModal';

const Inventory = () => {
  // Added auth and permissions
  const { currentUserData } = useUsers();

  // State for delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Permission state
  const [permissions, setPermissions] = useState({
    canView: true,
    canAdd: true,
    canEdit: true,
    canDelete: true
  });

  // Added image preview state
  const [imagePreview, setImagePreview] = useState(null);
  // Added edit image preview state
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Check permissions when user data is loaded
  useEffect(() => {
    if (currentUserData) {
      const isAdmin = currentUserData.role === 'admin';

      setPermissions({
        canView: isAdmin || (currentUserData.role === 'staff' &&
          currentUserData.pageAccess === 'inventory' &&
          currentUserData.inventoryPermissions?.readProduct),
        canAdd: isAdmin || (currentUserData.role === 'staff' &&
          currentUserData.pageAccess === 'inventory' &&
          currentUserData.inventoryPermissions?.addProduct),
        canEdit: isAdmin || (currentUserData.role === 'staff' &&
          currentUserData.pageAccess === 'inventory' &&
          currentUserData.inventoryPermissions?.editProduct),
        canDelete: isAdmin || (currentUserData.role === 'staff' &&
          currentUserData.pageAccess === 'inventory' &&
          currentUserData.inventoryPermissions?.deleteProduct)
      });
    }
  }, [currentUserData]);

  const { uploadImage, uploading } = useCloudinaryUpload();

  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  // State for sorting
  const [sortMethod, setSortMethod] = useState('nameAsc');

  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // hook
  const { products, loading, createProduct, deleteProduct, updateProduct } = useProducts();

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    category: '',
    brand: '',
    price: 0,
    spec1: '',
    spec1Label: '',
    spec2: '',
    spec2Label: '',
    stock: 0,
    type: '',
    weight: '',
    discount: 0,
    discountLabel: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    image: '',
    category: '',
    brand: '',
    price: 0,
    spec1: '',
    spec2: '',
    stock: 0,
    type: '',
    weight: '',
    discount: 0,
    discountLabel: '',
    discountedPrice: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    stock: ''
  });

  const validate = () => {
    const newErrors = {
      name: '',
      category: '',
      brand: '',
      price: '',
      stock: ''
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'Category is required.';
      isValid = false;
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required.';
      isValid = false;
    }

    if (isNaN(formData.price)) {
      newErrors.price = 'Price must be a number.';
      isValid = false;
    } else if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0.';
      isValid = false;
    }

    if (isNaN(formData.stock)) {
      newErrors.stock = 'Stock must be a number.';
      isValid = false;
    } else if (formData.stock < 1) {
      newErrors.stock = 'Stock must be at least 1.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const formatPrice = (price) => {
    return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  // Function to get type options based on category
  const getTypeOptions = (category) => {
    switch (category) {
      case 'Bikes':
        return bike_types;
      case 'Accessories':
        return accessories_types;
      case 'Gears':
        return gears_types;
      case 'Parts':
        return parts_types;
      default:
        return [];
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file' && files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' || name === 'weight' ? Number(value) : value,
        ...(name === 'category' && { type: '' })
      }));
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get filtered and sorted products
  const filteredProducts = products.filter(product => {
    // Apply category filter
    if (categoryFilter !== 'all' && product.category !== categoryFilter) {
      return false;
    }

    // Apply search filter
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortMethod) {
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'stockAsc':
        return a.stock - b.stock;
      case 'stockDesc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  // Get current products for pagination
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleEditClick = async (product) => {
    if (!permissions.canEdit) {
      toast.error("You don't have permission to edit products");
      return;
    }

    setEditProduct(product);
    setEditFormData({
      id: product.id,
      name: product.name || '',
      image: product.image || '',
      category: product.category || '',
      brand: product.brand || '',
      price: product.price || 0,
      spec1: product.spec1 || '',
      spec2: product.spec2 || '',
      stock: product.stock || 0,
      type: product.type || '',
      weight: product.weight || '',
      discount: product.discount || 0,
      discountLabel: product.discountLabel || '',
    });
    setEditImagePreview(null);
    setShowEditModal(true);
  };

  const handleViewDetails = (product) => {
    if (!permissions.canView) {
      toast.error("You don't have permission to view product details");
      return;
    }

    setViewProduct(product);
    setShowDetailsModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files.length > 0) {
      const file = files[0];
      setEditFormData(prev => ({
        ...prev,
        [name]: file
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'stock' || name === 'weight' ? Number(value) : value,
        ...(name === 'category' && { type: '' })
      }));
    }
  };

  // Categories and types for dropdowns
  const categories = ['Bikes', 'Gears', 'Parts', 'Accessories'];

  const bike_types = [
    'Road Bike', 'Mountain Bike', 'Hybrid Bike', 'Gravel Bike', 'Touring Bike', 'BMX Bike', 'Cyclocross Bike',
    'Folding Bike', 'Electric Bike (E-Bike)', 'Cruiser Bike', 'Fat Bike', 'Fixed Gear Bike (Fixie)', 'Track Bike',
    'Recumbent Bike', 'Tandem Bike', 'Cargo Bike', 'Commuter Bike', 'Time Trial Bike', 'Triathlon Bike', 'Kids Bike'
  ];

  const accessories_types = [
    'Helmet', 'Bike Lock', 'Lights (Front/Rear)', 'Bell or Horn', 'Water Bottle', 'Water Bottle Cage', 'Bike Pump',
    'Saddle Bag', 'Phone Mount', 'Bike Computer', 'Mirror', 'Kickstand', 'Mudguards/Fenders', 'Panniers',
    'Handlebar Grips/Tape', 'Chain Lube', 'Multi-tool', 'Tire Levers', 'Spare Tube', 'Patch Kit', 'Cycling Gloves',
    'Cycling Glasses', 'Bike Rack (for car or storage)', 'Frame Bag', 'Bike Cover','Cycling Shorts', 'Cycling Pants',
    'Cycling Shoes', 'Cycling Jersey', 'Cycling Jacket', 'Cycling Socks', 'Cycling Cap'
  ];

  const gears_types = [
    'Cassette', 'Chainring', 'Cranks', 'Bottom Bracket', 'Front Derailleur', 'Rear Derailleur', 'Shifters',
    'Gear Cables', 'Gear Levers', 'Freewheel', 'Derailleur Hanger', 'Gear Housing', 'Jockey Wheels',
    'Electronic Shifters', 'Internal Gear Hub', 'Gear Indicator Display', 'Thumb Shifter', 'Grip Shifter', 'Trigger Shifter'
  ];
  const parts_types = [
    'Frame', 'Fork', 'Handlebar', 'Stem', 'Headset', 'Grips/Bar Tape', 'Saddle', 'Seatpost', 'Seatpost Clamp',
    'Pedals', 'Brakes', 'Rims', 'Hubs', 'Spokes', 'Tires', 'Tubes', 'Valve Caps', 'Axles/Quick Release',
    'Chain Guard', 'Kickstand', 'Mudguards/Fenders'
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleAddButtonClick = () => {
    if (!permissions.canAdd) {
      toast.error("You don't have permission to add products");
      return;
    }

    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: '',
      category: '',
      brand: '',
      price: 0,
      spec1: '',
      spec1Label: '',
      spec2: '',
      spec2Label: '',
      stock: 0,
      type: '',
      weight: '',
      discount: 0,
      discountLabel: '',
    });
    setImagePreview(null);
    setErrors({
      name: '',
      category: '',
      brand: '',
      price: '',
      stock: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!permissions.canAdd) {
      toast.error("You don't have permission to add products");
      return;
    }

    if (!validate()) {
      return;
    }

    let imageUrl = null;
    if (formData.image instanceof File) {
      imageUrl = await uploadImage(formData.image, 'products');
    }

    const productData = {
      ...formData,
      image: imageUrl || formData.image,
      createdAt: '2025-07-26 10:55:20',
      createdBy: currentUserData?.email
    };

    try {
      await createProduct(productData);
      setShowAddModal(false);
      toast.success(`Product added ${productData.name} successfully`);
      resetForm();
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error('Failed to create product. Please try again.');
    }
  };

  const handleDeleteClick = (product) => {
    if (!permissions.canDelete) {
      toast.error("You don't have permission to delete products");
      return;
    }
    setProductToDelete(product);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete.id);
      toast.success(`Product ${productToDelete.name} deleted successfully`);
      setShowDeleteConfirmation(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!permissions.canEdit) {
      toast.error("You don't have permission to edit products");
      return;
    }

    if (!editFormData.name || !editFormData.category || !editFormData.price || editFormData.stock < 0) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      let imageUrl = null;
      if (editFormData.image instanceof File) {
        imageUrl = await uploadImage(editFormData.image, 'products');
      }

      const productData = {
        ...editFormData,
        image: imageUrl || editFormData.image,
        updatedAt: Date.now(),
        updatedBy: currentUserData?.email || 'dmin',
        discountedFinalPrice: (editFormData.price * (1 - (Number(editFormData.discount) || 0) / 100)).toFixed(2) || 0
      };

      await updateProduct(editProduct.id, productData);
      setShowEditModal(false);
      toast.success(`Product updated ${productData.name} successfully`);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    }
  };

  const handleAddModalClose = () => {
    setErrors({
      name: '',
      category: '',
      brand: '',
      price: '',
      stock: ''
    });
    setShowAddModal(false);
    resetForm();
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          {/* Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">INVENTORY</h1>
          </div>

          {/* Controls Container */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            {/* Left: Add Product Button */}
            {permissions.canAdd && (
              <button
                className="flex items-center bg-[#ff6900] hover:bg-[#e55e00] text-white py-2 px-3 sm:px-4 rounded-md text-sm sm:text-base"
                onClick={handleAddButtonClick}
              >
                <Plus size={18} className="mr-1 sm:mr-2" />
                Add Product
              </button>
            )}

            {/* Right: Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-48 md:w-56">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sort Dropdown */}
              <select
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
              >
                <option value="nameAsc">Name: A-Z</option>
                <option value="nameDesc">Name: Z-A</option>
                <option value="stockAsc">Stock: Low to High</option>
                <option value="stockDesc">Stock: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Table - Dark Theme */}
          <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden border border-gray-800">
            {/* Desktop Table */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                    <select
                      className="px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900] text-xs md:text-sm"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-800">
                {currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-800 text-white">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0 mr-3 md:mr-4">
                          <img
                            className="h-12 w-12 md:h-16 md:w-16 rounded-md object-cover"
                            src={product.image || '/images/logos/elmo.png'}
                            alt={product.name}
                          />
                        </div>
                        <div>
                          <div className="text-sm md:text-base font-medium text-white">{product.name}</div>
                          <div className="text-xs md:text-sm text-gray-400">
                            {
                              Number(product.discount) > 0
                                ? <>
                                  <span className="text-decoration-line-through">{`₱${new Intl.NumberFormat().format(product.price)}`}</span>
                                  <span className="ms-2">{`₱${new Intl.NumberFormat().format(Number(product.discountedFinalPrice))}`}</span>
                                </>
                                : `₱${new Intl.NumberFormat().format(product.price)}`
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex items-center justify-center text-xs font-medium rounded-full bg-[#ff6900] text-white tracking-wide min-w-[80px] w-fit">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm md:text-base text-white">{product.stock} units</div>
                      <div className={`text-xs ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                        {product.stock < 10 ? 'Low stock' : 'In stock'}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 md:space-x-2">
                        {permissions.canView && (
                          <button
                            className="text-blue-400 hover:text-blue-300 bg-gray-800 p-1 md:p-2 rounded-md"
                            onClick={() => handleViewDetails(product)}
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {permissions.canEdit && (
                          <button
                            className="text-[#ff6900] hover:text-[#e55e00] bg-gray-800 p-1 md:p-2 rounded-md"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button
                            className="text-red-500 hover:text-red-400 bg-gray-800 p-1 md:p-2 rounded-md"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-3">
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <div key={product.id} className="bg-gray-800 text-white p-3 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="h-16 w-16 flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-md object-cover"
                          src={product.image || '/placeholder-product.png'}
                          alt={product.name}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-400">{formatPrice(product.price)}</p>
                          </div>
                          <span className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-[#ff6900] text-blue-200">
                            {product.category}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-semibold">Stock:</span> {product.stock} units
                            <span className={`ml-2 text-xs ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                              ({product.stock < 10 ? 'Low stock' : 'In stock'})
                            </span>
                          </p>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          {permissions.canView && (
                            <button
                              className="text-blue-400 hover:text-blue-300 bg-gray-700 p-2 rounded-md"
                              onClick={() => handleViewDetails(product)}
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {permissions.canEdit && (
                            <button
                              className="text-[#ff6900] hover:text-[#e55e00] bg-gray-700 p-2 rounded-md"
                              onClick={() => handleEditClick(product)}
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {permissions.canDelete && (
                            <button
                              className="text-red-500 hover:text-red-400 bg-gray-700 p-2 rounded-md"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <p>No products found matching your search criteria</p>
                </div>
              )}
            </div>

            {/* Empty State */}
            {currentProducts.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-400">
                <p>No products found matching your search criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {sortedProducts.length > 0 && (
            <div className="flex justify-center mt-4 md:mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } text-sm`}
                >
                  <span className="sr-only">Previous</span>
                  &laquo;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    aria-current={currentPage === number ? 'page' : undefined}
                    className={`relative inline-flex items-center px-3 sm:px-4 py-2 border ${currentPage === number
                      ? 'z-10 bg-[#ff6900] border-[#ff6900] text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      } text-sm`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage === totalPages
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                    } text-sm`}
                  >
                  <span className="sr-only">Next</span>
                  &raquo;
                </button>
              </nav>
            </div>
          )}

          {/* Add Product Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Product</h2>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={handleAddModalClose}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form className="space-y-4 sm:space-y-4">
                    {/* Product Name and Brand in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter product name"
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                          name='brand'
                          value={formData.brand}
                          onChange={handleChange}
                          placeholder="Enter brand name"
                        />
                        {errors.brand && (
                          <p className="text-red-500 text-sm">{errors.brand}</p>
                        )}
                      </div>
                    </div>

                    {/* Category and Type in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="text-red-500 text-sm">{errors.category}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          name="type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                          value={formData.type}
                          onChange={handleChange}
                          disabled={!formData.category}
                        >
                          <option value="">Select type</option>
                          {getTypeOptions(formData.category).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price, Stock, and Weight in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₱)
                        </label>
                        <input
                          name='price'
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base appearance-none"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm">{errors.price}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          name='stock'
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base appearance-none"
                          placeholder="0"
                          value={formData.stock}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                              e.preventDefault();
                            }
                          }}
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-sm">{errors.stock}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          name='weight'
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base appearance-none"
                          placeholder="0.00"
                          value={formData.weight}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Product Image with Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Image Upload Area */}
                        <div className="flex items-center justify-center px-6 py-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6900] hover:text-[#e55e00]">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  name='image'
                                  accept="image/*"
                                  onChange={handleChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>

                        {/* Image Preview Area */}
                        <div className="flex items-center justify-center px-6 py-6 border-2 border-gray-200 rounded-md bg-gray-50">
                          {imagePreview ? (
                            <div className="text-center">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-32 max-w-full object-contain rounded-md shadow-sm"
                              />
                              <p className="text-xs text-gray-500 mt-2">Image Preview</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData(prev => ({ ...prev, image: '' }));
                                }}
                                className="mt-2 text-xs text-red-600 hover:text-red-800"
                              >
                                Remove Image
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">
                              <div className="mx-auto h-12 w-12 text-gray-300">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <p className="text-sm">No image selected</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        onClick={handleAddModalClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#ff6900] hover:bg-[#e55e00] text-white rounded-md"
                        onClick={handleSubmit}
                        disabled={uploading || loading}
                      >
                        {uploading || loading ? (
                          <>
                            <Loader2 className='animate-spin text-white h-4 w-4 sm:h-5 sm:w-5 inline mr-2' />
                            Adding...
                          </>
                        ) : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Edit Product Modal */}
          {showEditModal && editProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={handleEditModalClose}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form className="space-y-4 sm:space-y-6">
                    {/* Product Name and Brand in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name='name'
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] text-sm sm:text-base"
                          placeholder="Enter product name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                          name='brand'
                          value={editFormData.brand}
                          onChange={handleEditChange}
                          placeholder="Enter brand name"
                        />
                      </div>
                    </div>

                    {/* Category and Type in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                          name='category'
                          value={editFormData.category}
                          onChange={handleEditChange}
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                          name='type'
                          value={editFormData.type}
                          onChange={handleEditChange}
                        >
                          <option value="">Select type</option>
                          {getTypeOptions(editFormData.category).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price, Stock, and Weight in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₱) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] appearance-none"
                          name='price'
                          value={editFormData.price}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] appearance-none"
                          name='stock'
                          value={editFormData.stock}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] appearance-none"
                          name='weight'
                          value={editFormData.weight}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    {/* Discount Percentage and Label in a row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900] appearance-none"
                          name='discount'
                          value={editFormData.discount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 2) {
                              handleEditChange(e);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Label
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                          name='discountLabel'
                          value={editFormData.discountLabel}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>

                    {/* Product Image with Enhanced Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Image Upload Area */}
                        <div className="flex items-center justify-center px-6 py-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6900] hover:text-[#e55e00]">
                                <span>Upload a new image</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  name="image"
                                  accept="image/*"
                                  onChange={handleEditChange}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>

                        {/* Image Preview Area */}
                        <div className="flex items-center justify-center px-6 py-6 border-2 border-gray-200 rounded-md bg-gray-50">
                          {editImagePreview ? (
                            <div className="text-center">
                              <img
                                src={editImagePreview}
                                alt="New Preview"
                                className="max-h-32 max-w-full object-contain rounded-md shadow-sm"
                              />
                              <p className="text-xs text-gray-500 mt-2">New Image Preview</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditImagePreview(null);
                                  setEditFormData(prev => ({ ...prev, image: editProduct.image }));
                                }}
                                className="mt-2 text-xs text-red-600 hover:text-red-800"
                              >
                                Remove New Image
                              </button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <img
                                src={editProduct.image || '/images/logos/elmo.png'}
                                alt={editProduct?.name}
                                className="max-h-32 max-w-full object-contain rounded-md shadow-sm"
                              />
                              <p className="text-xs text-gray-500 mt-2">Current Image</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm sm:text-base"
                        onClick={handleEditModalClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex flex-row px-3 sm:px-4 py-2 bg-[#ff6900] hover:bg-[#e55e00] text-white rounded-md text-sm sm:text-base"
                        onClick={handleEditSubmit}
                        disabled={uploading || loading}
                      >
                        {uploading || loading ? (
                          <>
                            <Loader2 className='animate-spin text-white h-4 w-4 sm:h-5 sm:w-5' />
                            <span className="ml-2">Updating...</span>
                          </>
                        ) : 'Update Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && productToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="mb-6">
                  Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 inline" size={16} />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Details Modal */}
          <ProductDetailsModal
            viewProduct={viewProduct}
            showDetailsModal={showDetailsModal}
            setShowDetailsModal={setShowDetailsModal}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  );
};

export default Inventory;