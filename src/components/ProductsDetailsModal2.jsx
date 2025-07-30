import { useState, useEffect } from 'react';
import { X, Star, Flame } from 'lucide-react';
import { getRatingsByProductId } from '../services/ratingService';

const ProductDetailsModal2 = ({ showDetailsModal, viewProduct, setShowDetailsModal, formatPrice }) => {
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
                                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ color: '#111827' }}>
                                    {viewProduct.name || 'Product Name'}
                                </h3>
                                <div className="flex items-center mb-2">
                                    <span className="px-2 py-1 text-xs rounded-full bg-orange-600 text-white font-semibold">
                                        {viewProduct.category || 'Uncategorized'}
                                    </span>
                                    {viewProduct.brand && (
                                        <span className="ml-2 text-gray-700" style={{ color: '#374151' }}>
                                            Brand: <span className="font-semibold text-gray-900" style={{ color: '#111827' }}>{viewProduct.brand}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Ratings Summary */}
                                <div className="flex items-center mb-4">
                                    {totalRatings > 0 ? (
                                        <>
                                            <div className="flex items-center mr-3">
                                                {renderStars(averageRating)}
                                                <span className="ml-2 text-lg font-semibold text-gray-900" style={{ color: '#111827' }}>{averageRating}</span>
                                            </div>
                                            <span className="text-gray-600" style={{ color: '#4B5563' }}>({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-500" style={{ color: '#6B7280' }}>No ratings yet</span>
                                    )}
                                </div>

                                <div className="text-2xl font-bold text-orange-600 mb-4 flex gap-4 items-center">
                                    {
                                        Number(viewProduct.discount) <= 0 || viewProduct.discount === undefined || viewProduct.discount === null || isNaN(Number(viewProduct.discount)) ? (
                                            <>
                                                {viewProduct.price ? formatPrice(viewProduct.price) : '₱0.00'}
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-gray-500 line-through">
                                                    {viewProduct.price ? formatPrice(viewProduct.price) : '₱0.00'}
                                                </span>

                                                {(() => {
                                                    const price = Number(viewProduct.price);
                                                    const discount = Number(viewProduct.discount);

                                                    if (isNaN(price) || isNaN(discount) || price <= 0) {
                                                        return '₱0.00';
                                                    }

                                                    const discountedPrice = price * (1 - (discount / 100));

                                                    return ` ₱${discountedPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
                                                })()}
                                            </>
                                        )
                                    }

                                    {
                                        Number(viewProduct.discount) > 0 &&
                                        (viewProduct.discountLabel !== null && viewProduct.discountLabel !== undefined && String(viewProduct.discountLabel).trim() !== '') && (
                                            <div className="flex items-center justify-center gap-2 w-auto px-3 py-1 bg-orange-100 rounded-md text-orange-600 font-semibold">
                                                <p>-{viewProduct.discount}% </p>
                                                <p>{viewProduct.discountLabel} </p>
                                                <Flame size={16} />
                                            </div>
                                        )
                                    }
                                </div>

                                <div className="mb-2 text-gray-900" style={{ color: '#111827' }}>
                                    <span className="font-semibold">Stock:</span> {viewProduct.stock || 0} units
                                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${(viewProduct.stock || 0) < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {(viewProduct.stock || 0) < 10 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </div>

                                {viewProduct.type && (
                                    <div className="mb-2 text-gray-900" style={{ color: '#111827' }}>
                                        <span className="font-semibold">Type:</span> {viewProduct.type}
                                    </div>
                                )}

                                {viewProduct.weight && (
                                    <div className="mb-2 text-gray-900" style={{ color: '#111827' }}>
                                        <span className="font-semibold">Weight:</span> {viewProduct.weight}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product ID */}
                        <div className="mb-4 px-3 py-2 bg-gray-100 rounded-md">
                            <span className="font-semibold text-gray-900" style={{ color: '#111827' }}>Product ID:</span>
                            <span className="text-gray-700 ml-1" style={{ color: '#374151' }}>{viewProduct.id || 'N/A'}</span>
                        </div>

                        {/* Specifications */}
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3" style={{ color: '#111827' }}>Specifications</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {viewProduct.spec1Label && viewProduct.spec1 && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>{viewProduct.spec1Label}</div>
                                        <div className="text-sm text-gray-700" style={{ color: '#374151' }}>{viewProduct.spec1}</div>
                                    </div>
                                )}
                                {!viewProduct.spec1Label && viewProduct.spec1 && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>Specification 1</div>
                                        <div className="text-sm text-gray-700" style={{ color: '#374151' }}>{viewProduct.spec1}</div>
                                    </div>
                                )}
                                {viewProduct.spec2Label && viewProduct.spec2 && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>{viewProduct.spec2Label}</div>
                                        <div className="text-sm text-gray-700" style={{ color: '#374151' }}>{viewProduct.spec2}</div>
                                    </div>
                                )}
                                {!viewProduct.spec2Label && viewProduct.spec2 && (
                                    <div className="bg-gray-50 p-3 rounded">
                                        <div className="text-sm font-medium text-gray-900" style={{ color: '#111827' }}>Specification 2</div>
                                        <div className="text-sm text-gray-700" style={{ color: '#374151' }}>{viewProduct.spec2}</div>
                                    </div>
                                )}
                                {!viewProduct.spec1 && !viewProduct.spec2 && (
                                    <div className="col-span-full text-center py-3 text-sm text-gray-500" style={{ color: '#6B7280' }}>
                                        No specifications available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Customer Reviews Section */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4" style={{ color: '#111827' }}>Customer Reviews</h4>

                            {loadingRatings ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                                    <p className="mt-2 text-gray-600" style={{ color: '#4B5563' }}>Loading reviews...</p>
                                </div>
                            ) : ratings.length > 0 ? (
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                    {ratings.map((rating, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <div className="flex">
                                                        {renderStars(rating.rating)}
                                                    </div>
                                                    <span className="ml-2 font-semibold text-gray-900" style={{ color: '#111827' }}>{rating.rating}/5</span>
                                                </div>
                                                <span className="text-sm text-gray-500" style={{ color: '#6B7280' }}>
                                                    {formatDate(rating.timestamp || rating.createdAt)}
                                                </span>
                                            </div>

                                            {rating.userEmail && (
                                                <div className="mb-2">
                                                    <span className="text-sm text-gray-700" style={{ color: '#374151' }}>
                                                        By: {rating.userEmail}
                                                    </span>
                                                </div>
                                            )}

                                            {rating.comment && rating.comment.trim() && (
                                                <div className="text-gray-900" style={{ color: '#111827' }}>
                                                    <p className="text-sm">{rating.comment}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500" style={{ color: '#6B7280' }}>
                                    <Star size={48} className="mx-auto mb-2 text-gray-300" />
                                    <p>No customer reviews yet</p>
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

export default ProductDetailsModal2;