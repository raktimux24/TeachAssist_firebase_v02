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

  // Fetch user data from Firestore
  const fetchUserData = async (user: User) => {
    try {
      // Skip fetching if we're in the middle of creating a new user
      if ((user as any)._isCreatingNewUser) {
        console.log('Skipping fetchUserData during new user creation');
        return;
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      
      // Add retry logic for Firestore operations
      let retries = 3;
      let userDoc = null;
      
      while (retries > 0) {
        try {
          userDoc = await getDoc(userDocRef);
          break; // If successful, exit the retry loop
        } catch (fetchError) {
          console.warn(`Error fetching user data (attempt ${4 - retries}/3):`, fetchError);
          retries--;
          
          if (retries === 0) {
            throw fetchError; // Re-throw if all retries failed
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
      
      if (userDoc && userDoc.exists()) {
        const userData = userDoc.data() as UserInfo;
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
          
          // Update Firestore with initialized content stats
          await updateDoc(userDocRef, {
            contentStats: userData.contentStats,
            updatedAt: serverTimestamp()
          });
        }
        
        // Add photoURL from Firebase Auth user if available
        if (user.photoURL && !userData.photoURL) {
          userData.photoURL = user.photoURL;
          
          // Update the Firestore document with the photoURL - with retry logic
          let updateRetries = 3;
          while (updateRetries > 0) {
            try {
              await setDoc(userDocRef, { photoURL: user.photoURL, updatedAt: serverTimestamp() }, { merge: true });
              break; // If successful, exit the retry loop
            } catch (updateError) {
              console.warn(`Error updating user photoURL (attempt ${4 - updateRetries}/3):`, updateError);
              updateRetries--;
              
              if (updateRetries === 0) {
                console.error('Failed to update user photoURL after multiple attempts');
                // Continue without throwing - this is not critical
              }
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * (4 - updateRetries)));
            }
          }
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
          organization: 'Unknown', // Add the required organization property
          photoURL: user.photoURL || undefined,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Save to Firestore with retry logic
        let createRetries = 3;
        while (createRetries > 0) {
          try {
            await setDoc(doc(db, 'users', user.uid), defaultUserData);
            console.log('Created default user data:', defaultUserData);
            break; // If successful, exit the retry loop
          } catch (createError) {
            console.warn(`Error creating default user data (attempt ${4 - createRetries}/3):`, createError);
            createRetries--;
            
            if (createRetries === 0) {
              console.error('Failed to create default user data after multiple attempts');
              // Continue with local state even if Firestore update fails
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - createRetries)));
          }
        }
        
        // Update state regardless of Firestore success
        setUserInfo(defaultUserData);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      
      // Create a minimal user info object from the auth user to allow the app to function
      const fallbackUserInfo: UserInfo = {
        uid: user.uid,
        email: user.email || '',
        role: 'user', // Default to regular user for safety
        fullName: user.displayName || 'User',
        organization: 'Unknown', // Add the required organization property
      };
      
      console.log('Using fallback user info:', fallbackUserInfo);
      setUserInfo(fallbackUserInfo);
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
