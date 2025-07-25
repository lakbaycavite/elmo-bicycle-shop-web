import React from 'react'

const CartCard = ({
    productDetails,
    title,
    description1,
    image,
    productId,
    viewDetails,
    rating = 0,
    addToCart,
    children,
    className
}) => {
    // Generate stars based on rating (1-5)
    const renderStars = () => {
        const stars = [];
        const maxRating = 5;

        for (let i = 1; i <= maxRating; i++) {
            stars.push(
                <span key={i} className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                </span>
            );
        }

        return (
            <div className="flex my-2">
                {stars}
                <span className="text-sm text-gray-500 ml-2">({rating}/5)</span>
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {(image) && (
                <img
                    src={image}
                    alt={title || "Card image"}
                    className="w-full h-40 object-cover rounded-t-lg mb-4"
                />
            )}
            {title && <h2 className="font-semibold mb-2">{title}</h2>}
            {/* Display star rating */}
            {renderStars()}
            {description1 && <p className="text-gray-600">{description1}</p>}
            {children}

            <div className="mt-4 flex gap-2">



                <button
                    onClick={viewDetails}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition duration-200"
                >
                    Details
                </button>

                {/* Add to Cart button */}
                <button
                    onClick={() => addToCart(productId, 1, { ...productDetails })}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-200"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    )
}

export default CartCard