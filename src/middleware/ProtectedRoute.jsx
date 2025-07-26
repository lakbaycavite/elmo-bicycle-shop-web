import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Update import path as needed
import { getDatabase, ref, get } from 'firebase/database';
import { toast } from 'sonner'; // Or your preferred toast library

const ProtectedRoute = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkUserStatus = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setIsChecking(false);
                    return;
                }

                // Check user status in database
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (!snapshot.exists()) {
                    setIsChecking(false);
                    return;
                }

                const userData = snapshot.val();

                // Check if account is disabled
                if (userData.accountStatus === 'disabled') {
                    toast.error('Your account has been disabled. Please contact support.');
                    await auth.signOut();
                    setIsAllowed(false);
                }
                // Check role if required
                // else if (requiredRole && userData.role !== requiredRole) {
                //     toast.error('You do not have permission to access this page.');
                //     setIsAllowed(false);
                // }
                else {
                    setIsAllowed(true);
                }
            } catch (error) {
                console.error('Error checking user status:', error);
                setIsAllowed(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkUserStatus();
    }, []);

    if (isChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!auth.currentUser) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (!isAllowed) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;