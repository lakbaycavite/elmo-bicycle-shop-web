import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useOrder } from '../hooks/useOrder';
import { toast } from 'sonner';
import { useUsers } from '../hooks/useUser';
import VoucherSelector from './VoucherSelector';

const OrderDetailsModal = ({ show, onClose, onComplete }) => {
    const { getUserProfile } = useUsers();
    const { cart, totalPrice, clearCart } = useCart();
    const { createOrder, formatTimestamp, loading } = useOrder();
    const [paymentMethod, setPaymentMethod] = useState('Walk-in');
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState('');

    // New state to manage item-specific vouchers
    const [itemVouchers, setItemVouchers] = useState({}); // Stores { productId: { voucherId, discountPercentage, discountAmount } }

    // Calculate total discount from all applied vouchers
    const calculateTotalDiscount = () => {
        return Object.values(itemVouchers).reduce((sum, voucher) => {
            // Ensure we are only applying the discount once per item
            return sum + voucher.discountAmount;
        }, 0);
    };

    // Calculate total after all discounts
    const calculateTotal = () => {
        return totalPrice - calculateTotalDiscount();
    };

    // Handler to apply a voucher to a specific product
    const handleVoucherSelect = (productId, voucherData) => {
        if (voucherData) {
            // Add or update the voucher for the specific product
            setItemVouchers(prevVouchers => ({
                ...prevVouchers,
                [productId]: voucherData
            }));
        } else {
            // Remove the voucher for the specific product
            setItemVouchers(prevVouchers => {
                const newVouchers = { ...prevVouchers };
                delete newVouchers[productId];
                return newVouchers;
            });
        }
    };

    const handleCheckout = async () => {
        try {
            setIsProcessing(true);

            const currentUser = await getUserProfile();

            console.log("ItemVouchers:", itemVouchers);
            // Create a modified cart with voucher details
            const cartWithVouchers = cart.map(item => {
                const appliedVoucher = itemVouchers[item.productId];
                return {
                    ...item,
                    discountPercentage: appliedVoucher?.discountPercentage || 0,
                    discountAmount: appliedVoucher?.discountAmount || 0,
                    voucherCode: appliedVoucher?.voucherCode || null,
                    // The price of the item after discount
                    finalPrice: item.price - (appliedVoucher?.discountAmount / item.quantity || 0)
                };
            });

            // Create additional order details
            const orderDetails = {
                paymentMethod,
                fullName: currentUser?.firstName + ' ' + currentUser?.lastName,
                subtotal: totalPrice,
                totalDiscount: calculateTotalDiscount(),
                total: calculateTotal(),
                orderDate: formatTimestamp(),
                cart: cartWithVouchers // Use the modified cart
            };

            // Create the order
            await createOrder(notes, orderDetails)
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
            onComplete();

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
                backgroundColor: '#fff',
                color: '#000',
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
                    backgroundColor: '#ff6900',
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
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                        {/* Voucher selector for each item */}
                                        <div style={{ paddingLeft: '62px' }}>
                                            <VoucherSelector
                                                orderTotal={item.price * 1} // Only allow discounting a single item with a single quantity
                                                onVoucherSelect={(voucherData) => handleVoucherSelect(item.productId, voucherData)}
                                                selectedVoucherId={itemVouchers[item.productId]?.voucherId}
                                                className="mb-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Payment Method and Notes */}
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
                                    <span style={{ color: '#333' }}>Total Discount:</span>
                                    <span style={{ color: '#333' }}>-₱{new Intl.NumberFormat().format(calculateTotalDiscount())}</span>
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
                        disabled={cart.length === 0 || isProcessing || loading}
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
                        {isProcessing || loading ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;