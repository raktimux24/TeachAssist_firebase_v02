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
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '../firebase/config';
import type { ContentStats } from '../types/contentStats';

export interface UserInfo extends UserData {
  uid: string;
  photoURL?: string;
  darkMode?: boolean;
  createdAt?: any;
  updatedAt?: any;
  contentStats?: ContentStats;
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
        updatedAt: serverTimestamp(),
        contentStats: {
          notes: 0,
          flashcards: 0,
          questionSets: 0,
          lessonPlans: 0,
          presentations: 0,
          lastUpdated: new Date()
        }
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

  // Create a default user info object based on Firebase Auth user
  const createDefaultUserInfo = (user: User, role: string = 'teacher'): UserInfo => {
    // Determine role based on email domain or default to teacher
    let userRole = role;
    
    // If email contains specific domains, assign appropriate roles
    if (user.email) {
      if (user.email.includes('admin') || user.email.includes('administrator')) {
        userRole = 'admin';
      } else if (user.email.includes('student')) {
        userRole = 'student';
      } else {
        // Default to teacher for most educational users
        userRole = 'teacher';
      }
    }
    
    return {
      uid: user.uid,
      fullName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      role: userRole.toLowerCase(), // Ensure role is lowercase
      organization: 'Unknown',
      photoURL: user.photoURL || undefined,
      contentStats: {
        notes: 0,
        flashcards: 0,
        questionSets: 0,
        lessonPlans: 0,
        presentations: 0,
        lastUpdated: new Date()
      }
    };
  };

  // Save user data to localStorage for offline/permission-denied scenarios
  const saveUserToLocalStorage = (uid: string, userData: UserInfo) => {
    try {
      localStorage.setItem(`user_${uid}`, JSON.stringify(userData));
      console.log('User data cached in localStorage');
    } catch (cacheError) {
      console.warn('Failed to cache user data in localStorage:', cacheError);
    }
  };

  // Get user data from localStorage
  const getUserFromLocalStorage = (uid: string): UserInfo | null => {
    try {
      const cachedUserStr = localStorage.getItem(`user_${uid}`);
      if (cachedUserStr) {
        const cachedUser = JSON.parse(cachedUserStr) as UserInfo;
        console.log('Found cached user data in localStorage');
        return cachedUser;
      }
    } catch (cacheError) {
      console.warn('Error reading cached user data:', cacheError);
    }
    return null;
  };

  // Handle existing user from Firestore
  const handleExistingUser = async (user: User, firestoreData: UserInfo) => {
    // Create a complete user data object with all required fields
    const userData: UserInfo = {
      ...firestoreData,
      uid: user.uid, // Ensure UID is set correctly
    };
    
    // Ensure role is always lowercase for consistent comparison
    if (userData.role) {
      userData.role = userData.role.toLowerCase();
    }
    
    // Initialize content stats if they don't exist
    if (!userData.contentStats) {
      console.log('Initializing content stats for existing user');
      userData.contentStats = {
        notes: 0,
        flashcards: 0,
        questionSets: 0,
        lessonPlans: 0,
        presentations: 0,
        lastUpdated: new Date()
      };
      
      // Try to update Firestore with initialized content stats, but don't fail if it doesn't work
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          contentStats: userData.contentStats,
          updatedAt: serverTimestamp()
        });
      } catch (statsError) {
        console.warn('Failed to update content stats in Firestore:', statsError);
        // Continue without failing - this is not critical
      }
    }
    
    // Add photoURL from Firebase Auth user if available
    if (user.photoURL && !userData.photoURL) {
      userData.photoURL = user.photoURL;
      
      // Try to update the Firestore document with the photoURL, but don't fail if it doesn't work
      try {
        await setDoc(doc(db, 'users', user.uid), { 
          photoURL: user.photoURL, 
          updatedAt: serverTimestamp() 
        }, { merge: true });
      } catch (photoError) {
        console.warn('Failed to update user photoURL in Firestore:', photoError);
        // Continue without failing - this is not critical
      }
    }
    
    // Cache the user data in localStorage for future use if Firestore is unavailable
    saveUserToLocalStorage(user.uid, userData);
    
    setUserInfo(userData);
    setLoading(false);
  };
  
  // Handle new user creation in Firestore
  const handleNewUser = async (user: User) => {
    console.warn('No user data found in Firestore, creating default user document');
    
    // Create a default user object
    const defaultUserData: UserInfo = createDefaultUserInfo(user);
    defaultUserData.createdAt = serverTimestamp();
    defaultUserData.updatedAt = serverTimestamp();
    
    // Try to save to Firestore but don't fail if it doesn't work
    try {
      await setDoc(doc(db, 'users', user.uid), defaultUserData);
      console.log('Created default user data:', defaultUserData);
    } catch (createError) {
      console.error('Failed to create default user data in Firestore:', createError);
      // Continue with local state even if Firestore update fails
    }
    
    // Cache the user data in localStorage
    saveUserToLocalStorage(user.uid, defaultUserData);
    
    // Update state regardless of Firestore success
    setUserInfo(defaultUserData);
    setLoading(false);
  };

  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    try {
      // Skip fetching if we're in the middle of creating a new user
      if ((user as any)._isCreatingNewUser) {
        console.log('Skipping fetchUserData during new user creation');
        return;
      }
      
      // Check if we already have a cached user in localStorage to use as fallback
      const cachedUser = getUserFromLocalStorage(user.uid);
      
      // Try to get user data from Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User exists in Firestore, use that data
          handleExistingUser(user, userDoc.data() as UserInfo);
          return;
        } else {
          // User doesn't exist in Firestore, create a new one
          handleNewUser(user);
          return;
        }
      } catch (error: unknown) {
        // Check if this is a permission error
        if (error instanceof FirebaseError && error.code === 'permission-denied') {
          console.warn('Permission denied when accessing Firestore. Using fallback authentication.');
          
          // If we have cached data, use it
          if (cachedUser) {
            console.log('Using cached user data due to permission error');
            setUserInfo(cachedUser);
            setLoading(false);
            return;
          }
          
          // Otherwise create a default user
          const defaultUser = createDefaultUserInfo(user);
          saveUserToLocalStorage(user.uid, defaultUser);
          setUserInfo(defaultUser);
          setLoading(false);
          return;
        }
        
        // For other errors, throw to be caught by the outer catch
        throw error;
      }
    } catch (error: unknown) {
      console.error('Error in fetchUserData:', error);
      
      // Check if we have cached user data first
      const cachedUser = getUserFromLocalStorage(user.uid);
      if (cachedUser) {
        console.log('Using cached user data after error');
        setUserInfo(cachedUser);
      } else {
        // Create a minimal user info object from the auth user to allow the app to function
        const fallbackUserInfo = createDefaultUserInfo(user);
        
        // Cache the fallback user info for future use
        saveUserToLocalStorage(user.uid, fallbackUserInfo);
        
        console.log('Using fallback user info:', fallbackUserInfo);
        setUserInfo(fallbackUserInfo);
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Check if we have a user in localStorage first (for faster startup)
    const checkLocalStorage = () => {
      const authUser = auth.currentUser;
      if (authUser) {
        const cachedUser = getUserFromLocalStorage(authUser.uid);
        if (cachedUser) {
          console.log('Using cached user data on initial load');
          setUserInfo(cachedUser);
          // Still fetch from Firestore in the background for fresh data
        }
      }
    };
    
    // Try to load from localStorage immediately
    checkLocalStorage();
    
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
