import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loading component for better UX during authentication checks
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    <span className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading...</span>
  </div>
);

// Base route protection that handles authentication and role checking
const useRouteProtection = (allowedRoles: string[] | null = null) => {
  const { currentUser, userInfo, loading, hasRole } = useAuth();
  const location = useLocation();

  // Get the user's role directly from userInfo
  const userRole = userInfo?.role || null;

  // Log role information for debugging - only once when component mounts or when critical values change
  useEffect(() => {
    console.log('Route Protection - Auth State:', {
      loading,
      authenticated: !!currentUser,
      userInfoExists: !!userInfo,
      userRole,
      allowedRoles,
      path: location.pathname
    });
  }, [loading, currentUser, userInfo, userRole, allowedRoles, location.pathname]);

  // Handle loading state
  if (loading) {
    console.log('Route Protection - Loading...');
    return { isAllowed: false, element: <LoadingScreen /> };
  }

  // Handle unauthenticated users
  if (!currentUser) {
    console.log('Route Protection - No current user, redirecting to login');
    return { 
      isAllowed: false, 
      element: <Navigate to="/login" state={{ from: location }} replace /> 
    };
  }
  
  // If we have a currentUser but no userInfo, create a fallback userInfo
  if (!userInfo) {
    console.log('Route Protection - No userInfo available, using fallback');
    // Default to allowing access to prevent blank screens
    return { isAllowed: true, element: <Outlet /> };
  }

  // If no specific roles are required, just check authentication
  if (!allowedRoles) {
    console.log('Route Protection - No specific roles required, granting access');
    return { isAllowed: true, element: <Outlet /> };
  }

  // Check if user has the required role
  // Use the hasRole method from AuthContext for consistent role checking
  if (allowedRoles && hasRole(allowedRoles)) {
    console.log(`Route Protection - Access granted for role: ${userRole} to access ${allowedRoles.join(', ')}`);
    return { isAllowed: true, element: <Outlet /> };
  }

  // Manual role check as a fallback if hasRole fails
  const lowerCaseRole = userRole?.toLowerCase();
  const lowerCaseAllowedRoles = allowedRoles.map(role => role.toLowerCase());
  
  if (lowerCaseRole && lowerCaseAllowedRoles.includes(lowerCaseRole)) {
    console.log(`Route Protection - Manual check: Access granted for role: ${lowerCaseRole}`);
    return { isAllowed: true, element: <Outlet /> };
  }
  
  console.log(`Route Protection - Access denied for role: ${userRole}. Redirecting based on role.`);
  
  // Redirect based on user's role if they don't have access
  if (lowerCaseRole === 'admin') {
    return { 
      isAllowed: false, 
      element: <Navigate to="/admin" state={{ from: location }} replace /> 
    };
  } else if (lowerCaseRole === 'teacher') {
    return { 
      isAllowed: false, 
      element: <Navigate to="/teacher" state={{ from: location }} replace /> 
    };
  } else if (lowerCaseRole === 'student') {
    return { 
      isAllowed: false, 
      element: <Navigate to="/student" state={{ from: location }} replace /> 
    };
  }

  // Default fallback if role is unknown - allow access to prevent blank screens
  console.log('Route Protection - Unknown role, allowing access as fallback');
  return { isAllowed: true, element: <Outlet /> };
};

// Route that requires authentication (any authenticated user)
export const PrivateRoute: React.FC = () => {
  const { element } = useRouteProtection();
  return element;
};

// Route that requires admin role
export const AdminRoute: React.FC = () => {
  const { element } = useRouteProtection(['admin']);
  return element;
};

// Route that requires teacher role
export const TeacherRoute: React.FC = () => {
  const { element } = useRouteProtection(['teacher']);
  return element;
};

// Route that requires student role
export const StudentRoute: React.FC = () => {
  const { element } = useRouteProtection(['student']);
  return element;
};

// Route that redirects authenticated users to their respective dashboards
export const PublicRoute: React.FC = () => {
  const { currentUser, userInfo, loading } = useAuth();
  const location = useLocation();

  // Log for debugging
  useEffect(() => {
    console.log('PublicRoute - Auth State:', {
      loading,
      authenticated: !!currentUser,
      userInfoExists: !!userInfo,
      userRole: userInfo?.role,
      path: location.pathname
    });
  }, [loading, currentUser, userInfo, location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    // Check if we're already on a role-specific path to avoid redirect loops
    const currentPath = location.pathname;
    
    // If we're on login, signup, or forgot-password, don't redirect to avoid loops
    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/forgot-password') {
      return <Outlet />;
    }
    
    // If userInfo exists, use it for role-based redirection
    if (userInfo) {
      const userRole = userInfo.role?.toLowerCase();
      
      // Check if we're already on a role-specific path
      if (userRole === 'admin' && currentPath.startsWith('/admin')) {
        return <Outlet />;
      } else if (userRole === 'teacher' && currentPath.startsWith('/teacher')) {
        return <Outlet />;
      } else if (userRole === 'student' && currentPath.startsWith('/student')) {
        return <Outlet />;
      }
      
      // Redirect based on user role
      if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'teacher') {
        return <Navigate to="/teacher" replace />;
      } else if (userRole === 'student') {
        return <Navigate to="/student" replace />;
      }
    }
    
    // If we have a currentUser but no userInfo or unknown role, default to teacher dashboard
    console.log('PublicRoute - Authenticated but no role info, defaulting to teacher dashboard');
    return <Navigate to="/teacher" replace />;
  }

  return <Outlet />;
};
