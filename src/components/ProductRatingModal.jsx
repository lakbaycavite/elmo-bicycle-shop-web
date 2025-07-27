import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
// import { ref, push, serverTimestamp } from 'firebase/database';
// import { database } from '../firebase/firebase';
import { useAuth } from '../context/authContext/createAuthContext';
import { useRatings } from '../hooks/useRating';


const ProductRatingModal = ({ show, onClose, cartItems, onSubmitRatings }) => {
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    const [ratings, setRatings] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const { rateMultipleProducts } = useRatings();

    // Important: Reset and initialize ratings whenever cartItems changes
    useEffect(() => {
        if (cartItems && cartItems.length > 0) {
            setRatings(
                cartItems.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    rating: 0,
                    comment: ''
                }))
            );
            setCurrentProductIndex(0); // Reset to first product
        }
    }, [cartItems]);

    // Safety check to ensure we have valid data
    const currentProduct = cartItems && cartItems.length > currentProductIndex ? cartItems[currentProductIndex] : null;
    const progress = cartItems && cartItems.length > 0 ? ((currentProductIndex + 1) / cartItems.length) * 100 : 0;

    // Safety check - if no current product, don't render
    if (!show || !currentProduct) return null;

    const handleRatingChange = (rating) => {
        // Safety check to prevent errors
        if (!ratings[currentProductIndex]) return;

        const updatedRatings = [...ratings];
        updatedRatings[currentProductIndex].rating = rating;
        setRatings(updatedRatings);
    };

    const handleCommentChange = (comment) => {
        // Safety check to prevent errors
        if (!ratings[currentProductIndex]) return;

        const updatedRatings = [...ratings];
        updatedRatings[currentProductIndex].comment = comment;
        setRatings(updatedRatings);
    };

    const handleNext = async () => {
        if (currentProductIndex < cartItems.length - 1) {
            setCurrentProductIndex(currentProductIndex + 1);
        } else {
            // Submit all ratings when we've gone through all products
            try {
                setIsSubmitting(true);
                setError(null);

                // Only submit ratings where user actually rated (star value > 0)
                const ratingsToSubmit = ratings
                    .filter(r => r && r.rating > 0)
                    .map(r => ({
                        ...r,
                        userId: currentUser?.uid,
                        userEmail: currentUser?.email,
                    }));

                await rateMultipleProducts(ratingsToSubmit);
                onSubmitRatings(ratings);
                onClose();
            } catch (err) {
                console.error('Error submitting ratings:', err);
                setError(err.message || "Failed to submit ratings. You can try again or skip.");
                setIsSubmitting(false);
            }
        }
    };

    const handleSkip = () => {
        if (currentProductIndex < cartItems.length - 1) {
            setCurrentProductIndex(currentProductIndex + 1);
        } else {
            onSubmitRatings(ratings);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md relative">
                {/* Header */}
                <div className="bg-[#2E2E2E] text-white p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-lg font-bold">Rate Your Purchase</h2>
                    <button onClick={onClose} className="text-gray-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 h-1">
                    <div
                        className="bg-orange-500 h-1"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}


                    {/* Product info */}
                    <div className="flex items-center mb-6">
                        <img
                            src={currentProduct.image || '/images/logos/elmo.png'}
                            alt={currentProduct.name}
                            className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="ml-4">
                            <h3 className="font-bold text-gray-800">{currentProduct.name}</h3>
                            <p className="text-sm text-gray-500">Product {currentProductIndex + 1} of {cartItems.length}</p>
                        </div>
                    </div>

                    {/* Rating stars */}
                    <div className="mb-4">
                        <p className="font-medium mb-2">How would you rate this product?</p>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => handleRatingChange(star)}
                                    className={`p-1 rounded-full transition-all ${ratings[currentProductIndex]?.rating >= star
                                        ? 'text-yellow-400 scale-110'
                                        : 'text-gray-300 hover:text-yellow-300'
                                        }`}
                                >
                                    <Star
                                        size={24}
                                        fill={ratings[currentProductIndex]?.rating >= star ? "currentColor" : "none"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <p className="font-medium mb-2">Share your thoughts (optional)</p>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            rows="3"
                            placeholder="What did you like or dislike about this product?"
                            value={ratings[currentProductIndex]?.comment || ''}
                            onChange={(e) => handleCommentChange(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            disabled={isSubmitting}
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:bg-gray-400"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : currentProductIndex < cartItems.length - 1 ? 'Next' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductRatingModal;