import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase/firebase';
import {
    getSpinWheelConfig,
    updateSpinWheelConfig,
    getUserSpinAttempts,
    addSpinAttempts,
    spinWheel,
    getUserVouchers,
    useVoucher as getUseVoucher,
    deleteVoucher,
    unuseVoucher,
} from '../services/discountService';

export function useDiscount() {
    const [spinWheelConfig, setSpinWheelConfig] = useState(null);
    const [userSpinAttempts, setUserSpinAttempts] = useState(0);
    const [userVouchers, setUserVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [spinResult, setSpinResult] = useState(null);

    // Load spin wheel configuration
    const loadSpinWheelConfig = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const config = await getSpinWheelConfig();
            setSpinWheelConfig(config);
        } catch (err) {
            console.error('Error loading spin wheel config:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load user's spin attempts
    const loadUserSpinAttempts = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const { spinAttempts } = await getUserSpinAttempts();
            setUserSpinAttempts(spinAttempts);
        } catch (err) {
            console.error('Error loading user spin attempts:', err);
            setError(err.message);
        }
    }, []);

    // Load user's vouchers
    const loadUserVouchers = useCallback(async () => {
        const user = auth.currentUser;
        if (!user) {
            setUserVouchers([]);
            return;
        }

        try {
            const vouchers = await getUserVouchers();
            setUserVouchers(vouchers);
        } catch (err) {
            console.error('Error loading user vouchers:', err);
            setError(err.message);
        }
    }, []);

    // Initialize data on component mount
    useEffect(() => {
        loadSpinWheelConfig();
        loadUserSpinAttempts();
        loadUserVouchers();
    }, [loadSpinWheelConfig, loadUserSpinAttempts, loadUserVouchers]);

    // Update spin wheel configuration (admin only)
    const updateSpinConfig = useCallback(async (newConfig) => {
        try {
            setLoading(true);
            setError(null);
            await updateSpinWheelConfig(newConfig);
            setSpinWheelConfig(newConfig);
            return { success: true, message: 'Configuration updated successfully' };
        } catch (err) {
            console.error('Error updating spin config:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle wheel spin
    const handleSpin = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await spinWheel();
            setSpinResult(result);
            setUserSpinAttempts(result.remainingAttempts);

            // Reload vouchers if user won a discount
            if (result.voucherId) {
                await loadUserVouchers();
            }

            return result;
        } catch (err) {
            console.error('Error spinning wheel:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadUserVouchers]);

    // Apply voucher to order
    const applyVoucher = useCallback(async (voucherId, orderId) => {
        try {
            setLoading(true);
            setError(null);
            const result = await getUseVoucher(voucherId, orderId);

            // Reload vouchers to update the used status
            await loadUserVouchers();

            return result;
        } catch (err) {
            console.error('Error applying voucher:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadUserVouchers]);

    // Calculate discount amount for a given order total
    const calculateDiscountAmount = useCallback((orderTotal, discountPercentage) => {
        return (orderTotal * discountPercentage) / 100;
    }, []);

    // Get available (unused and not expired) vouchers
    const getAvailableVouchers = useCallback(() => {
        return userVouchers.filter(voucher =>
            !voucher.isUsed && !voucher.isExpired
        );
    }, [userVouchers]);

    // Clear spin result
    const clearSpinResult = useCallback(() => {
        setSpinResult(null);
    }, []);

    // Process order completion and add spin attempts
    const processOrderCompletion = useCallback(async (userId, orderAmount) => {
        try {
            const result = await addSpinAttempts(userId, orderAmount);

            // Refresh user's spin attempts
            await loadUserSpinAttempts();

            return result;
        } catch (err) {
            console.error('Error processing order completion:', err);
            setError(err.message);
            throw err;
        }
    }, [loadUserSpinAttempts]);

    const deleteUsedVoucher = useCallback(async (voucherIds) => {
        try {
            setLoading(true);
            setError(null);
            const result = await deleteVoucher(voucherIds);

            // Reload vouchers to reflect the deletion
            await loadUserVouchers();

            return result;
        } catch (err) {
            console.error('Error deleting voucher(s):', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadUserVouchers]);

    const returnVoucherOnCancel = useCallback(async (voucherIds) => {
        try {
            setLoading(true);
            setError(null);
            const result = await unuseVoucher(voucherIds);

            // Reload vouchers to reflect the reverted status
            await loadUserVouchers();

            return result;
        } catch (err) {
            console.error('Error returning voucher(s) on cancellation:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadUserVouchers]);


    return {
        // State
        spinWheelConfig,
        userSpinAttempts,
        userVouchers,
        loading,
        error,
        spinResult,

        // Functions
        loadSpinWheelConfig,
        loadUserSpinAttempts,
        loadUserVouchers,
        updateSpinConfig,
        handleSpin,
        applyVoucher,
        calculateDiscountAmount,
        getAvailableVouchers,
        clearSpinResult,
        processOrderCompletion,
        deleteUsedVoucher,
        returnVoucherOnCancel,

        // Computed values
        availableVouchers: getAvailableVouchers(),
        hasSpinAttempts: userSpinAttempts > 0
    };
}