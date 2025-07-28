import React, { useState, useEffect } from 'react';
import { Ticket, X, Check, AlertCircle } from 'lucide-react';
import { useDiscount } from '../hooks/useDiscount';

const VoucherSelector = ({
    orderTotal,
    onVoucherSelect,
    selectedVoucherId = null,
    className = ""
}) => {
    const { availableVouchers, calculateDiscountAmount, loading } = useDiscount();
    const [showVouchers, setShowVouchers] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    // Find selected voucher when component mounts or vouchers change
    useEffect(() => {
        if (selectedVoucherId && availableVouchers.length > 0) {
            const voucher = availableVouchers.find(v => v.id === selectedVoucherId);
            setSelectedVoucher(voucher);
        }
    }, [selectedVoucherId, availableVouchers]);

    const handleVoucherSelect = (voucher) => {
        const discountAmount = calculateDiscountAmount(orderTotal, voucher.discountPercentage);
        setSelectedVoucher(voucher);
        setShowVouchers(false);

        onVoucherSelect({
            voucherId: voucher.id,
            discountPercentage: voucher.discountPercentage,
            discountAmount: discountAmount,
            voucherCode: voucher.code,
            voucherDescription: voucher.description
        });
    };

    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        onVoucherSelect(null);
    };

    if (loading) {
        return (
            <div className={`animate-pulse bg-gray-200 rounded-lg h-12 ${className}`}></div>
        );
    }

    return (
        <div className={className}>
            {/* Selected Voucher Display */}
            {selectedVoucher ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <Ticket className="text-green-600" size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-green-800">
                                    {selectedVoucher.discountPercentage}% OFF Applied
                                </div>
                                <div className="text-sm text-green-600">
                                    Code: {selectedVoucher.code}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Saving: ₱{calculateDiscountAmount(orderTotal, selectedVoucher.discountPercentage).toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveVoucher}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove voucher"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                /* Voucher Selection Button */
                <div>
                    <button
                        onClick={() => setShowVouchers(!showVouchers)}
                        className="w-full flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
                        disabled={availableVouchers.length === 0}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                                <Ticket className="text-orange-600" size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-gray-800">
                                    {availableVouchers.length > 0
                                        ? 'Apply Discount Voucher'
                                        : 'No Vouchers Available'
                                    }
                                </div>
                                <div className="text-sm text-gray-500">
                                    {availableVouchers.length > 0
                                        ? `${availableVouchers.length} voucher${availableVouchers.length !== 1 ? 's' : ''} available`
                                        : 'Spin the wheel to win vouchers'
                                    }
                                </div>
                            </div>
                        </div>
                        {availableVouchers.length > 0 && (
                            <div className="text-orange-600">
                                {showVouchers ? '▼' : '▶'}
                            </div>
                        )}
                    </button>

                    {/* Voucher List */}
                    {showVouchers && availableVouchers.length > 0 && (
                        <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-lg">
                            <div className="p-3 border-b bg-gray-50">
                                <h3 className="font-medium text-gray-800">Select a Voucher</h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                                {availableVouchers.map((voucher) => {
                                    const discountAmount = calculateDiscountAmount(orderTotal, voucher.discountPercentage);
                                    const finalTotal = orderTotal - discountAmount;

                                    return (
                                        <div
                                            key={voucher.id}
                                            className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleVoucherSelect(voucher)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-2 rounded-lg">
                                                        <Ticket size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800">
                                                            {voucher.discountPercentage}% OFF
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {voucher.description}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono">
                                                            Code: {voucher.code}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-green-600">
                                                        Save ₱{discountAmount.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        New total: ₱{finalTotal.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expiry Warning */}
                                            {(() => {
                                                const expiryDate = new Date(voucher.expiresAt);
                                                const today = new Date();
                                                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                                                if (daysUntilExpiry <= 7) {
                                                    return (
                                                        <div className="mt-2 flex items-center gap-1 text-orange-600 text-xs">
                                                            <AlertCircle size={12} />
                                                            <span>
                                                                {daysUntilExpiry <= 1
                                                                    ? 'Expires today!'
                                                                    : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`
                                                                }
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* No Vouchers Message */}
            {availableVouchers.length === 0 && !selectedVoucher && (
                <div className="text-center text-gray-500 py-4">
                    <Ticket size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No discount vouchers available</p>
                    <p className="text-xs">Spin the wheel to win vouchers!</p>
                </div>
            )}
        </div>
    );
};

export default VoucherSelector;