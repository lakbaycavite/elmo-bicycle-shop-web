import { useState, useCallback } from 'react';
import { useFirebaseApp } from 'reactfire';
import { createUserStatusService } from './userStatusService';

export function useUserStatus(currentUserLogin) {
    const app = useFirebaseApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create service instance
    const userStatusService = createUserStatusService(app);

    // Wrap service methods with loading and error handling
    const disableUser = useCallback(async (params) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userStatusService.disableUser({
                ...params,
                adminUser: currentUserLogin,
                timestamp: new Date().toISOString()
            });
            return result;
        } catch (err) {
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [userStatusService, currentUserLogin]);

    const reactivateUser = useCallback(async (params) => {
        setLoading(true);
        setError(null);

        try {
            const result = await userStatusService.reactivateUser({
                ...params,
                adminUser: currentUserLogin,
                timestamp: new Date().toISOString()
            });
            return result;
        } catch (err) {
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [userStatusService, currentUserLogin]);

    const isUserDisabled = useCallback(async (uid) => {
        setLoading(true);
        setError(null);

        try {
            return await userStatusService.isUserDisabled(uid);
        } catch (err) {
            setError(err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [userStatusService]);

    const getUserStatusHistory = useCallback(async (uid) => {
        setLoading(true);
        setError(null);

        try {
            return await userStatusService.getUserStatusHistory(uid);
        } catch (err) {
            setError(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [userStatusService]);

    return {
        disableUser,
        reactivateUser,
        isUserDisabled,
        getUserStatusHistory,
        loading,
        error
    };
}