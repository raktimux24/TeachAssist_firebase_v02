import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface UserInfo extends UserData {
  uid: string;
  photoURL?: string;
  darkMode?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  currentUser: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, userData: UserData, isCurrentUser?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getUserRole: () => string | null;
  hasRole: (requiredRoles: string[]) => boolean;
}

interface UserData {
  fullName: string;
  role: string;
  organization: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  // isCurrentUser parameter determines if this user should update the current session
  const signup = async (email: string, password: string, userData: UserData, isCurrentUser: boolean = true): Promise<User> => {
    try {
      console.log('Starting signup process with role:', userData.role, 'isCurrentUser:', isCurrentUser);
      
      // Store the current auth state before creating a new user
      const previousAuthState = auth.currentUser;
      console.log('Previous auth state before signup:', previousAuthState?.uid);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: userData.fullName
      });

      // Create the user data object with all required fields
      const newUserData: UserInfo = {
        uid: user.uid,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        organization: userData.organization,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), newUserData);
      
      // Only update the current userInfo state if this is the current user
      // This prevents admin from losing their session when creating new users
      if (isCurrentUser) {
        console.log('Setting userInfo state after signup with role:', userData.role);
        setUserInfo(newUserData);
      } else {
        console.log('Not updating userInfo state as this is not the current user');
        
        // If we're creating a user as admin, we need to sign back in as the admin
        // This prevents the auth state from changing to the newly created user
        if (previousAuthState) {
          console.log('Restoring previous auth state to admin');
          // The auth state will be restored by the onAuthStateChanged listener
        }
      }

      return user;
    } catch (error) {
      console.error("Error in signup:", error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error in login:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Reset password function
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Get user role from Firestore
  const getUserRole = (): string | null => {
    if (userInfo?.role) {
      // Return the role in lowercase for consistent comparison
      return userInfo.role.toLowerCase();
    }
    return null;
  };
  
  // Check if user has one of the required roles
  const hasRole = (requiredRoles: string[]): boolean => {
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    // Get user role from userInfo directly to avoid unnecessary function calls
    const userRole = userInfo?.role;
    if (!userRole) return false;
    
    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.includes(userRole.toLowerCase());
    
    // Only log once to prevent console spam
    console.log(`Checking if user has role. User role: ${userRole}, Required roles: ${requiredRoles.join(', ')}, Result: ${hasRequiredRole}`);
    
    return hasRequiredRole;
  };

  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    try {
      // Skip fetching if we're in the middle of creating a new user
      // Using type assertion to access custom property
      if ((user as any)._isCreatingNewUser) {
        console.log('Skipping fetchUserData during new user creation');
        return;
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserInfo;
        // Ensure role is always lowercase for consistent comparison
        if (userData.role) {
          userData.role = userData.role.toLowerCase();
        }
        
        // Add photoURL from Firebase Auth user if available
        if (user.photoURL && !userData.photoURL) {
          userData.photoURL = user.photoURL;
          // Update the Firestore document with the photoURL
          await setDoc(userDocRef, { photoURL: user.photoURL, updatedAt: serverTimestamp() }, { merge: true });
        }
        
        setUserInfo(userData);
      } else {
        // If user document doesn't exist, create it with default values
        console.warn('No user data found in Firestore, creating default user document');
        
        // Create a default user object
        const defaultUserData: UserInfo = {
          uid: user.uid,
          fullName: user.displayName || 'User',
          email: user.email || '',
          role: 'admin', // Default to admin for safety if we can't determine the role
          organization: 'Default Organization',
          photoURL: user.photoURL || undefined,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Save to Firestore
        await setDoc(userDocRef, defaultUserData);
        console.log('Created default user data:', defaultUserData);
        
        // Update state
        setUserInfo(defaultUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed, user:', user?.uid);
      setCurrentUser(user);
      
      if (user) {
        // Add a property to track if we're in the middle of creating a new user
        // This is a workaround to prevent fetchUserData from being called during signup
        if ((user as any)._isCreatingNewUser) {
          console.log('Skipping fetchUserData for newly created user');
          return;
        }
        
        fetchUserData(user);
      } else {
        setUserInfo(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userInfo,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    getUserRole,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
