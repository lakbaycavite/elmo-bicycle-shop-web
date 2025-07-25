import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { toast } from 'sonner';

const OrderDetailsModal = ({ show, onClose }) => {
    const { cart, totalPrice, clearCart } = useCart();
    const { createOrder, formatTimestamp } = useOrder();
    const [paymentMethod, setPaymentMethod] = useState('Walk-in');
    const [discount, setDiscount] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    // Calculate total after discount
    const calculateTotal = () => {
        const discountAmount = (discount / 100) * totalPrice;
        return totalPrice - discountAmount;
    };

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);

            // Create additional order details
            const orderDetails = {
                paymentMethod,
                discount,
                subtotal: totalPrice,
                total: calculateTotal(),
                orderDate: formatTimestamp()
            };

            // Create the order
            await createOrder({}, notes, orderDetails)
                .then(() => {
                    toast.success('Order placed successfully!');
                })
                .catch((error) => {
                    console.error("Error placing order:", error);
                    toast.error(`Failed to place order`);
                });

            // Clear the cart
            await clearCart();

            // Close the modal
            onClose();

        } catch (error) {
            alert(`Error placing order: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div className="modal-content" style={{
                backgroundColor: '#fff', /* Light background for high contrast */
                color: '#000',           /* Dark text for high contrast */
                borderRadius: '8px',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                animation: 'fadeIn 0.3s'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#ff6900', /* Your primary-accent color */
                    color: 'white',
                    borderRadius: '8px 8px 0 0'
                }}>
                    <h3 style={{ margin: 0 }}>Complete Your Order</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer'
                        }}
                        disabled={isProcessing}
                    >
                        &times;
                    </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '16px', overflowY: 'auto' }}>
                    <h5 style={{ marginBottom: '16px', color: '#333' }}>Order Summary</h5>

                    {cart.length === 0 ? (
                        <p>Your cart is empty</p>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div style={{ marginBottom: '20px' }}>
                                {cart.map(item => (
                                    <div key={item.productId} style={{
                                        padding: '12px',
                                        borderBottom: '1px solid #eee',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={item.image || "/images/bike.png"}
                                                alt={item.name}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    marginRight: '12px',
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: '#333' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                                    {item.brand} {item.type && `- ${item.type}`}
                                                </div>
                                                <span style={{
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    Qty: {item.quantity}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: '#ff8c00' }}>
                                                ₱{new Intl.NumberFormat().format(item.price * item.quantity)}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                                ₱{new Intl.NumberFormat().format(item.price)} each
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Method */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <h5 style={{ marginBottom: '16px', color: '#333' }}>Payment Details</h5>
                                <div style={{ marginBottom: '16px' }}>
                                    <label htmlFor="paymentMethod" style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                                        Mode of Payment
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: 'white',
                                            color: '#333',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <option value="Walk-in">Walk-in</option>
                                        <option value="Gcash">Gcash</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="notes" style={{ display: 'block', marginBottom: '8px', color: '#333' }}>
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any special instructions or notes about your order"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            backgroundColor: 'white',
                                            color: '#333',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* GCash Instructions */}
                            {paymentMethod === 'Gcash' && (
                                <div style={{
                                    backgroundColor: '#cfe2ff',
                                    border: '1px solid #9ec5fe',
                                    color: '#084298',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '20px'
                                }}>
                                    <h6 style={{ marginBottom: '8px', color: '#084298' }}>GCash Payment Instructions:</h6>
                                    <p style={{ margin: 0 }}>Please send your payment to GCash number: <strong>09123456789</strong></p>
                                    <p style={{ margin: 0 }}>Include your name and order ID in the message section.</p>
                                </div>
                            )}

                            {/* Order Total */}
                            <div style={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                padding: '16px'
                            }}>
                                <h5 style={{ marginBottom: '16px', color: '#333' }}>Order Total</h5>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ color: '#333' }}>Subtotal:</span>
                                    <span style={{ color: '#333' }}>₱{new Intl.NumberFormat().format(totalPrice)}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <div>
                                        <span style={{ color: '#333' }}>Discount:</span>
                                        <select
                                            style={{
                                                width: '80px',
                                                marginLeft: '8px',
                                                padding: '4px 8px',
                                                backgroundColor: 'white',
                                                color: '#333',
                                                border: '1px solid #ced4da',
                                                borderRadius: '4px'
                                            }}
                                            value={discount}
                                            onChange={(e) => setDiscount(Number(e.target.value))}
                                        >
                                            <option value="0">0%</option>
                                            {/* <option value="5">5%</option>
                                            <option value="10">10%</option>
                                            <option value="15">15%</option>
                                            <option value="20">20%</option> */}
                                        </select>
                                    </div>
                                    <span style={{ color: '#333' }}>-₱{new Intl.NumberFormat().format((discount / 100) * totalPrice)}</span>
                                </div>

                                <hr style={{ borderColor: '#dee2e6' }} />

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>
                                    <span style={{ color: '#333' }}>Total:</span>
                                    <span style={{ color: '#ff8c00', fontSize: '1.2rem' }}>
                                        ₱{new Intl.NumberFormat().format(calculateTotal())}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                                    Order date: {formatTimestamp()}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid #ddd',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0 0 8px 8px'
                }}>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: isProcessing ? 0.7 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#ff6900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: cart.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                            opacity: cart.length === 0 || isProcessing ? 0.7 : 1
                        }}
                    >
                        {isProcessing ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;