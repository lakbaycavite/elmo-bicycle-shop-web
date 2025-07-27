import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    ArrowUp,
    ArrowDown,
    Upload,
    Loader2,
    Eye,
    AlertCircle // Added for permission alerts
} from 'lucide-react';
import { useProducts } from '../../hooks/useProduct';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { useUsers } from '../../hooks/useUser'; // Added for user data
import { toast } from 'sonner';
import ProductDetailsModal from '../../components/ProductsDetailsModal';

const Inventory = () => {
    // Added auth and permissions
    const { currentUserData } = useUsers();

    // Permission state
    const [permissions, setPermissions] = useState({
        canView: true, // Default to true for existing functionality
        canAdd: true,
        canEdit: true,
        canDelete: true
    });
    // Check permissions when user data is loaded
    useEffect(() => {
        if (currentUserData) {
            const isAdmin = currentUserData.role === 'admin';

            // Admin has all permissions, staff permissions are based on inventory settings
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
    const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal
    const [editProduct, setEditProduct] = useState(null);
    const [viewProduct, setViewProduct] = useState(null); // New state to store product for viewing

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
        weight: ''
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
        weight: ''
    });

    const formatPrice = (price) => {
        return `₱${price?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file' && files.length > 0) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file
            }));

            // Create a preview URL
            // const reader = new FileReader();
            // reader.onload = () => {
            //     setPreviewUrl(reader.result);
            // };
            // reader.readAsDataURL(file);

        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'price' || name === 'stock' ? Number(value) : value
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
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // Modified to check permissions before opening edit modal
    const handleEditClick = async (product) => {
        // Check if user has edit permission
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
            weight: product.weight || ''
        });
        setShowEditModal(true);
    };

    // Modified to check permissions before opening details modal
    const handleViewDetails = (product) => {
        // Check if user has view permission
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

            // Create a preview URL
            // const reader = new FileReader();
            // reader.onload = () => {
            //     setPreviewUrl(reader.result);
            // };
            // reader.readAsDataURL(file);

        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: name === 'price' || name === 'stock' ? Number(value) : value
            }));
        }

    };

    // Categories and types for dropdowns
    const categories = ['Bikes', 'Gears', 'Parts', 'Accessories'];
    const types = [
        'Frame', 'Fork', 'Handlebar', 'Stem', 'Headset', 'Grips/Bar Tape',
        'Saddle', 'Seatpost', 'Seatpost clamp', 'Pedals', 'Breaks', 'Rims',
        'Hubs', 'Spokes', 'Tires', 'Tubes', 'Valve caps', 'Axles/Quick release',
        'Chain guard', 'Kickstand', 'Mudguards/Fenders'
    ];

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Modified to check permissions before opening add modal
    const handleAddButtonClick = () => {
        if (!permissions.canAdd) {
            toast.error("You don't have permission to add products");
            return;
        }

        setShowAddModal(true);
    };

    // Modified to check permissions before submitting
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verify permission again as a security measure
        if (!permissions.canAdd) {
            toast.error("You don't have permission to add products");
            return;
        }

        if (!formData.name || !formData.category || !formData.price || formData.stock < 0) {
            alert('Please fill in all required fields.');
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
            createdBy: 'lanceballicud'
        };

        try {
            await createProduct(productData);
            setShowAddModal(false);
            toast.success('Product added successfully');

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
                weight: ''
            });
        } catch (err) {
            console.error('Error creating product:', err);
            alert('Failed to create product. Please try again.');
        }
    };

    // Modified to check permissions before deleting
    const handleDelete = async (id) => {
        // Verify permission
        if (!permissions.canDelete) {
            toast.error("You don't have permission to delete products");
            return;
        }

        console.log(`Deleting product with ID: ${id}`);

        try {
            await deleteProduct(id);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    // Modified to check permissions before submitting edit
    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Verify permission again as a security measure
        if (!permissions.canEdit) {
            toast.error("You don't have permission to edit products");
            return;
        }

        if (!editFormData.name || !editFormData.category || !editFormData.price || editFormData.stock < 0) {
            alert('Please fill in all required fields.');
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
                updatedAt: '2025-07-26 10:55:20',
                updatedBy: 'lanceballicud'
            };

            await updateProduct(editProduct.id, productData);
            setShowEditModal(false);
            toast.success('Product updated successfully');
            console.log('Product updated successfully!:', editFormData);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        }
    };

    // If user doesn't have view permission, show access denied
    // if (!permissions.canView && currentUserData) {
    //     return (
    //         <div className="min-h-screen bg-white flex">
    //             <Sidebar userType={"admin"} />
    //             <div className="flex-1 p-8 flex items-center justify-center">
    //                 <div className="text-center bg-red-50 p-8 rounded-lg max-w-md shadow-lg">
    //                     <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
    //                     <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
    //                     <p className="text-gray-600 mb-4">
    //                         You don't have permission to view the inventory.
    //                     </p>
    //                     <p className="text-sm text-gray-500">
    //                         Please contact an administrator if you believe this is an error.
    //                     </p>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-x-auto">
                {/* User and DateTime Info */}
                <div className="text-sm text-gray-500 mb-4">
                    {/* Added timestamp information here */}
                </div>

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory</h1>

                {/* Controls Container */}
                <div className="flex justify-between items-center mb-6">
                    {/* Left: Add Product Button - Only show if user has permission */}
                    {permissions.canAdd ? (
                        <button
                            className="flex items-center bg-[#ff6900] hover:bg-[#e55e00] text-white py-2 px-4 rounded-md"
                            onClick={handleAddButtonClick}
                        >
                            <Plus size={18} className="mr-2" />
                            Add Product
                        </button>
                    ) : (
                        <div></div> // Empty div to maintain layout
                    )}

                    {/* Right: Search and Sort */}
                    <div className="flex space-x-3">
                        {/* Search */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900]"
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
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                                    Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                                    <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6900] focus:border-[#ff6900]"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                                    Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#ff6900] uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-900 divide-y divide-gray-800">
                            {currentProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-800 text-white">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 flex-shrink-0 mr-4">
                                                <img className="h-16 w-16 rounded-md object-cover" src={product.image ? product.image : null}
                                                    alt={product.name} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{product.name}</div>
                                                <div className="text-sm text-gray-400">{formatPrice(product.price)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#ff6900] text-blue-200">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-white">{product.stock} units</div>
                                        <div className={`text-xs ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                                            {product.stock < 10 ? 'Low stock' : 'In stock'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {/* View button - Only show if user has view permission */}
                                            {permissions.canView && (
                                                <button
                                                    className="text-blue-400 hover:text-blue-300 bg-gray-800 p-2 rounded-md"
                                                    onClick={() => handleViewDetails(product)}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}

                                            {/* Edit button - Only show if user has edit permission */}
                                            {permissions.canEdit && (
                                                <button
                                                    className="text-[#ff6900] hover:text-[#e55e00] bg-gray-800 p-2 rounded-md"
                                                    onClick={() => handleEditClick(product)}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            )}

                                            {/* Delete button - Only show if user has delete permission */}
                                            {permissions.canDelete && (
                                                <button className="text-red-500 hover:text-red-400 bg-gray-800 p-2 rounded-md"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty State */}
                    {currentProducts.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <p>No products found matching your search criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {sortedProducts.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                &laquo;
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    aria-current={currentPage === number ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 border ${currentPage === number
                                        ? 'z-10 bg-[#ff6900] border-[#ff6900] text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                        }`}
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
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                &raquo;
                            </button>
                        </nav>
                    </div>
                )}

                {/* Add Product Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Add Product</h2>
                                    <button
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowAddModal(false)}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form className="space-y-6">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            name='name'
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            placeholder="Enter product name"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price and Stock in a row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Price (₱)
                                            </label>
                                            <input
                                                name='price'
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stock
                                            </label>
                                            <input
                                                name='stock'
                                                type="number"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                placeholder="0"
                                                value={formData.stock}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Image
                                        </label>
                                        <div className="flex items-center justify-center px-6 py-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6900] hover:text-[#e55e00]">
                                                        <span>Upload a file</span>
                                                        <input type="file" className="sr-only"
                                                            name='image'
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
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-[#ff6900] hover:bg-[#e55e00] text-white rounded-md"
                                            onClick={handleSubmit}
                                        >
                                            Add Product
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
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
                                    <button
                                        className="text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form className="space-y-4">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            defaultValue={editProduct.name}
                                            name='name'
                                            value={editFormData.name}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            defaultValue={editProduct.category}
                                            name='category'
                                            value={editFormData.category}
                                            onChange={handleEditChange}
                                        >
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price and Stock in a row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Price (₱)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                defaultValue={editProduct.price}
                                                name='price'
                                                value={editFormData.price}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stock
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                defaultValue={editProduct.stock}
                                                name='stock'
                                                value={editFormData.stock}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            defaultValue={editProduct.brand}
                                            name='brand'
                                            value={editFormData.brand}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    {/* Specs in a row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Spec 1
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                defaultValue={editProduct.spec1}
                                                name='spec1'
                                                value={editFormData.spec1}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Spec 2
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                defaultValue={editProduct.spec2}
                                                name='spec2'
                                                value={editFormData.spec2}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weight
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            defaultValue={editProduct.weight}
                                            name='weight'
                                            value={editFormData.weight}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Type
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                            defaultValue={editProduct.type || ''}
                                            name='type'
                                            value={editFormData.type}
                                            onChange={handleEditChange}
                                        >
                                            <option value="">Not Applicable</option>
                                            {types.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Product Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Product Image
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={editProduct.image ? editProduct.image : null}
                                                alt={editProduct.name}
                                                className="h-20 w-20 rounded-md object-cover border border-gray-300"
                                            />
                                            <div className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md">
                                                <div className="space-y-1 text-center">
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#ff6900] hover:text-[#e55e00]">
                                                            <span>Upload a new image</span>
                                                            <input type="file" className="sr-only"
                                                                name="image"
                                                                onChange={handleEditChange}
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex flex-row px-4 py-2 bg-[#ff6900] hover:bg-[#e55e00] text-white rounded-md"
                                            onClick={handleEditSubmit}
                                            disabled={uploading || loading}
                                        >
                                            {uploading || loading ? (
                                                <>
                                                    <Loader2 className='animate-spin text-white' />
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

                {/* Product Details Modal - NEW */}

                <ProductDetailsModal viewProduct={viewProduct} showDetailsModal={showDetailsModal} setShowDetailsModal={setShowDetailsModal} formatPrice={formatPrice} />

            </div>
        </div>
    );
};

export default Inventory;