import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '@/hooks/useAuth';
import {Loader2} from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'customer' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  children,
                                                                  requiredRole
                                                              }) => {
    const {user, profile, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
            </div>
        );
    }

    if (!user || !profile) {
        return <Navigate to="/auth" state={{from: location}} replace/>;
    }

    if (requiredRole && profile.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const redirectTo = profile.role === 'admin' ? '/admin' : '/dashboard';
        return <Navigate to={redirectTo} replace/>;
    }

    return <>{children}</>;
};
