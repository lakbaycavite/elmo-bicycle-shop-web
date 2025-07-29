import { useState, useEffect } from 'react';
import { X, Star, Flame } from 'lucide-react';
import { getRatingsByProductId } from '../services/ratingService';

const ProductDetailsModal = ({ showDetailsModal, viewProduct, setShowDetailsModal, formatPrice }) => {
    const [ratings, setRatings] = useState([]);
    const [loadingRatings, setLoadingRatings] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);

    // Load ratings when modal opens and product changes
    useEffect(() => {
        if (showDetailsModal && viewProduct?.id) {
            loadRatings();
        }
    }, [showDetailsModal, viewProduct?.id,]);

    const loadRatings = async () => {
        if (!viewProduct?.id) return;

        setLoadingRatings(true);
        try {
            const productRatingsData = await getRatingsByProductId(viewProduct.id);

            // Convert object to array
            const productRatings = Object.values(productRatingsData || {});

            setRatings(productRatings);

            // Calculate average rating
            if (productRatings.length > 0) {
                const validRatings = productRatings.filter(r => r.rating && !isNaN(Number(r.rating)));
                if (validRatings.length > 0) {
                    const sum = validRatings.reduce((total, r) => total + Number(r.rating), 0);
                    setAverageRating((sum / validRatings.length).toFixed(1));
                    setTotalRatings(validRatings.length);
                } else {
                    setAverageRating(0);
                    setTotalRatings(0);
                }
            } else {
                setAverageRating(0);
                setTotalRatings(0);
            }
        } catch (error) {
            console.error('Error loading ratings:', error);
            setRatings([]);
            setAverageRating(0);
            setTotalRatings(0);
        } finally {
            setLoadingRatings(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const numRating = Number(rating) || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    className={i <= numRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
            );
        }
        return stars;
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown date';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!showDetailsModal || !viewProduct) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                        <button
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="mb-6">
                        {/* Product Image and Basic Info */}
                        <div className="flex flex-col md:flex-row mb-6 gap-4">
                            <div className="w-full md:w-1/3">
                                <img
                                    src={viewProduct.image || 'https://via.placeholder.com/300'}
                                    alt={viewProduct.name}
                                    className="w-full h-auto rounded-lg object-cover shadow-md"
                                />
                            </div>

                            <div className="w-full md:w-2/3">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{viewProduct.name}</h3>

                                <div className="flex items-center mb-2">
                                    <span className="px-2 py-1 text-xs rounded-full bg-[#ff6900] text-white font-semibold">
                                        {viewProduct.category}
                                    </span>
                                    {viewProduct.brand && (
                                        <span className="ml-2 text-gray-600">
                                            Brand: <span className="font-semibold">{viewProduct.brand}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Ratings Summary */}
                                <div className="flex items-center mb-4">
                                    {totalRatings > 0 ? (
                                        <>
                                            <div className="flex items-center mr-3">
                                                {renderStars(averageRating)}
                                                <span className="ml-2 text-lg font-semibold text-gray-700">{averageRating}</span>
                                            </div>
                                            <span className="text-gray-600">({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">No ratings yet</span>
                                    )}
                                </div>

                                <div className="text-2xl font-bold text-[#ff6900] mb-4 flex gap-4">
                                    {
                                        // Check if discount is 0, or if it's undefined/null/not a valid number,
                                        // which effectively means no discount should be applied.
                                        // We also check if the numerical value of discount is 0 or less, which means no effective discount.
                                        Number(viewProduct.discount) <= 0 || viewProduct.discount === undefined || viewProduct.discount === null || isNaN(Number(viewProduct.discount)) ? (
                                            // Case: No discount or invalid discount value
                                            <>
                                                {/* Display the original price */}
                                                {viewProduct.price ? formatPrice(viewProduct.price) : '₱0.00'}
                                            </>
                                        ) : (
                                            // Case: There is a valid discount greater than 0
                                            <>
                                                {/* Display the original price with a strikethrough */}
                                                <span className="text-gray-500 line-through">
                                                    {viewProduct.price ? formatPrice(viewProduct.price) : '₱0.00'}
                                                </span>

                                                {/* Calculate and display the discounted price */}
                                                {(() => {
                                                    const price = Number(viewProduct.price);
                                                    const discount = Number(viewProduct.discount);

                                                    // Ensure price and discount are valid numbers before calculation
                                                    if (isNaN(price) || isNaN(discount) || price <= 0) {
                                                        return '₱0.00'; // Return default if price or discount is invalid
                                                    }

                                                    const discountedPrice = price * (1 - (discount / 100));

                                                    return ` ₱${discountedPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
                                                })()}
                                            </>
                                        )
                                    }

                                    {/* Second Conditional: Displaying Discount Label */}
                                    {
                                        // Display the discount label ONLY IF:
                                        // 1. There is an actual discount (viewProduct.discount is greater than 0 and a valid number)
                                        // 2. viewProduct.discountLabel is not null or undefined
                                        // 3. viewProduct.discountLabel is not an empty string (trim() is used to handle strings with only spaces)
                                        Number(viewProduct.discount) > 0 &&
                                        (viewProduct.discountLabel !== null && viewProduct.discountLabel !== undefined && String(viewProduct.discountLabel).trim() !== '') && (
                                            <div style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', gap: '0.5rem', width: '300px', backgroundColor: 'rgba(255, 105, 0, 0.1)', borderRadius: '4px', height: '27px' }} className="text-[#ff6900] font-semibold">
                                                <p>-{viewProduct.discount}% </p>
                                                <p>{viewProduct.discountLabel} </p>
                                                <p><Flame /></p> {/* Assuming Flame is a React component */}
                                            </div>
                                        )
                                    }

                                </div>

                                <div className="mb-2">
                                    <span className="font-semibold">Stock:</span> {viewProduct.stock} units
                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${viewProduct.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {viewProduct.stock < 10 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </div>

                                {viewProduct.type && (
                                    <div className="mb-2">
                                        <span className="font-semibold">Type:</span> {viewProduct.type}
                                    </div>
                                )}

                                {viewProduct.weight && (
                                    <div className="mb-2">
                                        <span className="font-semibold">Weight:</span> {viewProduct.weight}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product ID */}
                        <div className="mb-4 px-3 py-2 bg-gray-100 rounded-md">
                            <span className="font-semibold">Product ID:</span> {viewProduct.id}
                        </div>

                        {/* Specifications */}
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h4 className="text-lg font-semibold mb-3">Specifications</h4>
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="divide-y divide-gray-200">
                                    {viewProduct.spec1Label && viewProduct.spec1 && (
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{viewProduct.spec1Label}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{viewProduct.spec1}</td>
                                        </tr>
                                    )}
                                    {!viewProduct.spec1Label && viewProduct.spec1 && (
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">Specification 1</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{viewProduct.spec1}</td>
                                        </tr>
                                    )}
                                    {viewProduct.spec2Label && viewProduct.spec2 && (
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">{viewProduct.spec2Label}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{viewProduct.spec2}</td>
                                        </tr>
                                    )}
                                    {!viewProduct.spec2Label && viewProduct.spec2 && (
                                        <tr>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-700">Specification 2</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{viewProduct.spec2}</td>
                                        </tr>
                                    )}
                                    {!viewProduct.spec1 && !viewProduct.spec2 && (
                                        <tr>
                                            <td colSpan="2" className="px-4 py-3 text-sm text-gray-500 text-center">No specifications available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Customer Reviews Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-lg font-semibold mb-4">Customer Reviews</h4>

                            {loadingRatings ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#ff6900]"></div>
                                    <p className="mt-2 text-gray-600">Loading reviews...</p>
                                </div>
                            ) : ratings.length > 0 ? (
                                <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {ratings.map((rating, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="flex">
                                                        {renderStars(rating.rating)}
                                                    </div>
                                                    <span className="ml-2 font-semibold">{rating.rating}/5</span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(rating.timestamp || rating.createdAt)}
                                                </span>
                                            </div>

                                            {rating.userEmail && (
                                                <div className="mb-2">
                                                    <span className="text-sm text-gray-600">
                                                        By: {rating.userEmail}
                                                    </span>
                                                </div>
                                            )}

                                            {rating.comment && rating.comment.trim() && (
                                                <div className="text-gray-700">
                                                    <p className="text-sm">{rating.comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Star size={48} className="mx-auto mb-2 text-gray-300" />
                                    <p>No customer reviews yet</p>
                                    {/* <p className="text-sm">Be the first to review this product!</p> */}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsModal;