import { useState, useEffect } from 'react';
import { database } from '../firebase/firebase';
import { ref, onValue, update } from 'firebase/database';

export const useVoucher = () => {
    const [vouchers, setVouchers] = useState([]);
    const [appliedVouchers, setAppliedVouchers] = useState([]);

    // Load all vouchers
    useEffect(() => {
        const vouchersRef = ref(database, 'vouchers');
        const unsubscribe = onValue(vouchersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const vouchersArray = Object.entries(data).map(([id, voucher]) => ({
                    id,
                    ...voucher,
                    isUsed: voucher.isUsed || false,
                    orderId: voucher.orderId || null,
                    isConsumed: voucher.isConsumed || false
                }));
                setVouchers(vouchersArray);
            }
        });
        return () => unsubscribe();
    }, []);

    // Automatically handle voucher states based on order status
    const syncVouchersWithOrder = async (order) => {
        if (!order.voucherIds || order.voucherIds.length === 0) return;

        const updates = {};
        
        if (order.status === 'cancelled') {
            // Auto-return vouchers on cancellation
            order.voucherIds.forEach(voucherId => {
                updates[`vouchers/${voucherId}/isUsed`] = false;
                updates[`vouchers/${voucherId}/orderId`] = null;
            });
        } 
        else if (order.status === 'paid') {
            // Auto-consume vouchers on approval
            order.voucherIds.forEach(voucherId => {
                updates[`vouchers/${voucherId}/isConsumed`] = true;
                updates[`vouchers/${voucherId}/consumedAt`] = Date.now();
            });
        }
        // Pending orders keep vouchers reserved (no changes needed)

        if (Object.keys(updates).length > 0) {
            await update(ref(database), updates);
        }
    };

    // Apply voucher to cart
    const applyVoucher = (voucher) => {
        if (voucher.isUsed && !voucher.isConsumed) {
            return { success: false, message: 'Voucher is already reserved' };
        }
        if (voucher.isConsumed) {
            return { success: false, message: 'Voucher has already been used' };
        }

        setAppliedVouchers(prev => [...prev, voucher]);
        return { success: true };
    };

    // Remove voucher from cart
    const removeVoucher = (voucherId) => {
        setAppliedVouchers(prev => prev.filter(v => v.id !== voucherId));
    };

    // Reserve vouchers when order is placed
    const reserveVouchers = async (orderId) => {
        const updates = {};
        appliedVouchers.forEach(voucher => {
            updates[`vouchers/${voucher.id}/isUsed`] = true;
            updates[`vouchers/${voucher.id}/orderId`] = orderId;
        });

        try {
            await update(ref(database), updates);
            return true;
        } catch (error) {
            console.error("Error reserving vouchers:", error);
            return false;
        }
    };

    return {
        vouchers,
        appliedVouchers,
        applyVoucher,
        removeVoucher,
        reserveVouchers,
        syncVouchersWithOrder,
        setAppliedVouchers
    };
};