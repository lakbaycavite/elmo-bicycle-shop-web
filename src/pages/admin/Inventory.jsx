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
    Upload
} from 'lucide-react';
import { useProducts } from '../../hooks/useProduct';

const Inventory = () => {
    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    // State for sorting
    const [sortMethod, setSortMethod] = useState('nameAsc');

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // hook
    const { products, loading, error, createProduct } = useProducts();

    // State for products (dummy data with reliable images)
    // const [products, setProducts] = useState([
    //     { id: 1, name: 'Mountain Bike XC-290', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=80&h=80&fit=crop', category: 'Bikes', stock: 15, price: 899.99, brand: 'Trek', spec1: 'Carbon Frame', spec2: '29" Wheels', weight: '12.5kg', type: 'Frame' },
    //     { id: 2, name: 'Road Helmet Pro', image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=80&h=80&fit=crop', category: 'Gears', stock: 28, price: 149.99, brand: 'Giro', spec1: 'Ventilated', spec2: 'Lightweight', weight: '250g', type: 'Headset' },
    //     { id: 3, name: 'Bike Chain Ultra', image: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=80&h=80&fit=crop', category: 'Parts', stock: 50, price: 29.99, brand: 'Shimano', spec1: '11-speed', spec2: 'Rust-resistant', weight: '300g', type: 'Chain Guard' },
    //     { id: 4, name: 'Water Bottle 750ml', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=80&h=80&fit=crop', category: 'Accessories', stock: 60, price: 12.99, brand: 'CamelBak', spec1: 'BPA-free', spec2: 'Insulated', weight: '100g', type: null },
    //     { id: 5, name: 'MTB Pedals Clip-in', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=80&h=80&fit=crop', category: 'Parts', stock: 25, price: 89.99, brand: 'Crankbrothers', spec1: 'Aluminum', spec2: 'Sealed bearings', weight: '380g', type: 'Pedals' },
    //     { id: 6, name: 'Bike Lock Heavy Duty', image: 'https://images.unsplash.com/photo-1569942126139-124d7e4f3efe?w=80&h=80&fit=crop', category: 'Accessories', stock: 35, price: 49.99, brand: 'Kryptonite', spec1: 'Steel', spec2: '12mm thickness', weight: '1.2kg', type: null },
    //     { id: 7, name: 'Road Bike RX-550', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=80&h=80&fit=crop', category: 'Bikes', stock: 8, price: 1299.99, brand: 'Specialized', spec1: 'Carbon Frame', spec2: 'Disc Brakes', weight: '8.9kg', type: 'Frame' },
    //     { id: 8, name: 'Cycling Gloves Winter', image: 'https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=80&h=80&fit=crop', category: 'Gears', stock: 45, price: 34.99, brand: 'Pearl Izumi', spec1: 'Waterproof', spec2: 'Padded', weight: '95g', type: 'Grips/Bar Tape' },
    //     { id: 9, name: 'Bike Saddle Comfort', image: 'https://images.unsplash.com/photo-1605045544284-d6c06410f27f?w=80&h=80&fit=crop', category: 'Parts', stock: 32, price: 59.99, brand: 'Brooks', spec1: 'Leather', spec2: 'Springs', weight: '450g', type: 'Saddle' },
    //     { id: 10, name: 'Bike Light Set', image: 'https://images.unsplash.com/photo-1598517989151-3f83c08def4f?w=80&h=80&fit=crop', category: 'Accessories', stock: 40, price: 39.99, brand: 'Cygolite', spec1: 'USB Rechargeable', spec2: '800 lumens', weight: '150g', type: null },
    //     { id: 11, name: 'Mountain Bike Tires 27.5"', image: 'https://images.unsplash.com/photo-1573113521692-9754353225e1?w=80&h=80&fit=crop', category: 'Parts', stock: 22, price: 49.99, brand: 'Maxxis', spec1: 'Tubeless', spec2: 'All-terrain', weight: '780g', type: 'Tires' },
    //     { id: 12, name: 'Bike Computer GPS', image: 'https://images.unsplash.com/photo-1555514058-a033d20a6a44?w=80&h=80&fit=crop', category: 'Accessories', stock: 18, price: 199.99, brand: 'Garmin', spec1: 'Color display', spec2: '20hr battery', weight: '60g', type: null },
    // ]);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value
        }));
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

    // Open edit modal with product data
    const handleEditClick = (product) => {
        setEditProduct(product);
        setShowEditModal(true);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.category || !formData.price || formData.stock < 0) {
            alert('Please fill in all required fields.');
            return;
        }

        await createProduct(formData)
            .then(() => {
                setShowAddModal(false);
            })
            .catch(err => {
                console.error('Error creating product:', err);
                alert('Failed to create product. Please try again.');
            })
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
    }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <Sidebar userType="admin" />

            {/* Main Content */}
            <div className="flex-1 p-8 overflow-x-auto">
                {/* User and DateTime Info */}
                <div className="text-sm text-gray-500 mb-4">

                </div>

                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory</h1>

                {/* Controls Container */}
                <div className="flex justify-between items-center mb-6">
                    {/* Left: Add Product Button */}
                    <button
                        className="flex items-center bg-[#ff6900] hover:bg-[#e55e00] text-white py-2 px-4 rounded-md"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={18} className="mr-2" />
                        Add Product
                    </button>

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
                                        <option value="all">All Categoriesss</option>
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
                                                <div className="text-sm text-gray-400">${product.price.toFixed(2)}</div>
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
                                        <div className="flex space-x-4">
                                            <button
                                                className="text-[#ff6900] hover:text-[#e55e00] bg-gray-800 p-2 rounded-md"
                                                onClick={() => handleEditClick(product)}
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-400 bg-gray-800 p-2 rounded-md">
                                                <Trash2 size={18} />
                                            </button>
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
                                                Price ($)
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
                                                            value={formData.image}
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
                                                Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#ff6900] focus:border-[#ff6900]"
                                                defaultValue={editProduct.price}
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
                                                            <input type="file" className="sr-only" />
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
                                            className="px-4 py-2 bg-[#ff6900] hover:bg-[#e55e00] text-white rounded-md"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;