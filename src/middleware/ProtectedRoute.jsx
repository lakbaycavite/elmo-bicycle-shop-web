import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase/firebase'; // Update import path as needed
import { getDatabase, ref, get } from 'firebase/database';
import { toast } from 'sonner'; // Or your preferred toast library

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [userRole, setUserRole] = useState(null);
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
                setUserRole(userData.role);

                // Check if account is disabled
                if (userData.accountStatus === 'disabled') {
                    toast.error('Your account has been disabled. Please contact support.');
                    await auth.signOut();
                    setIsAllowed(false);
                    setIsChecking(false);
                    return;
                }

                // Check role permissions if requiredRoles is specified
                if (requiredRoles.length > 0) {
                    if (!requiredRoles.includes(userData.role)) {
                        toast.error('You do not have permission to access this page.');
                        setIsAllowed(false);
                        setIsChecking(false);
                        return;
                    }
                }

                setIsAllowed(true);
            } catch (error) {
                console.error('Error checking user status:', error);
                setIsAllowed(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkUserStatus();
    }, [requiredRoles]);

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
        // Redirect based on user role to appropriate dashboard
        if (userRole === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (userRole === 'staff') {
            return <Navigate to="/admin/dashboard" replace />; // or "/staff/dashboard" if you have separate staff routes
        } else {
            return <Navigate to="/customer/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;