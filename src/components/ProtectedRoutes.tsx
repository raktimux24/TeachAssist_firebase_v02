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
    if (!loading && currentUser && userInfo) {
      console.log('Route Protection - User Role:', userRole);
      console.log('Route Protection - Allowed Roles:', allowedRoles);
    }
  }, [loading, currentUser, userInfo?.uid]); // Only depend on critical values

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

  // If no specific roles are required, just check authentication
  if (!allowedRoles) {
    return { isAllowed: true, element: <Outlet /> };
  }

  // Check if user has the required role
  // Use the hasRole method from AuthContext for consistent role checking
  if (allowedRoles && hasRole(allowedRoles)) {
    console.log(`Route Protection - Access granted for role: ${userRole} to access ${allowedRoles.join(', ')}`);
    return { isAllowed: true, element: <Outlet /> };
  }

  // Redirect based on user's role if they don't have access
  // Using toLowerCase() for consistent comparison
  const lowerCaseRole = userRole?.toLowerCase();
  
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

  // Default fallback if role is unknown
  return { 
    isAllowed: false, 
    element: <Navigate to="/" state={{ from: location }} replace /> 
  };
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (currentUser && userInfo) {
    // Get user role directly from userInfo to avoid unnecessary function calls
    const userRole = userInfo.role?.toLowerCase();
    
    // Check if we're already on a role-specific path to avoid redirect loops
    const currentPath = location.pathname;
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
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
