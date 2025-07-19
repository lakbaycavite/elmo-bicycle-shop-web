import React from 'react'

const CartCard = ({ title, description, image, children, className = "" }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {image && (
                <img
                    src={image}
                    alt={title || "Card image"}
                    className="w-full h-40 object-cover rounded-t-lg mb-4"
                />
            )}
            {title && <h2 className="font-semibold mb-2">{title}</h2>}
            {description && <p className="text-gray-600 mb-4">{description}</p>}
            {children}
        </div>
    )
}

export default CartCard