import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { AdminUser } from '../types';

interface AdminAuthContextType {
  currentUser: User | null;
  adminProfile: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  bootstrapAdminDoc: (uid: string, email: string, name: string) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('omove_admin_session_unlocked') === 'true';
  });
  const isExplicitLogout = useRef<boolean>(false);

  // Require explicit login on fresh session
  useEffect(() => {
    if (sessionStorage.getItem('omove_admin_session_unlocked') !== 'true') {
      signOut(auth).catch(() => {});
      setIsAdminUnlocked(false);
    }
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setError(null);

      if (user) {
        setIsLoading(true);
        // Listen to admin/{uid} in real-time
        const adminDocRef = doc(db, 'admin', user.uid);
        
        unsubscribeProfile = onSnapshot(adminDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const profile: AdminUser = {
              uid: user.uid,
              email: data.email || user.email || '',
              name: data.name || user.displayName || 'Administrator',
              role: data.role || 'user',
              active: Boolean(data.active),
            };
            setAdminProfile(profile);
          } else {
            setAdminProfile(null);
          }
          setIsLoading(false);
        }, (err) => {
          console.warn('Error reading admin profile:', err);
          setAdminProfile(null);
          setIsLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setAdminProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    isExplicitLogout.current = false;
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const uid = userCredential.user.uid;

      // Verify admin role immediately
      const adminDocRef = doc(db, 'admin', uid);
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists()) {
        setError(`Access Denied: Account (${email}) is not registered in the admin collection (admin/${uid}).`);
        setIsLoading(false);
        return false;
      }

      const data = adminSnap.data();
      if (data.role !== 'admin' || data.active !== true) {
        setError(`Access Denied: Account role is "${data.role || 'unassigned'}" and active=${Boolean(data.active)}. Required: role="admin" and active=true.`);
        setIsLoading(false);
        return false;
      }

      setAdminProfile({
        uid,
        email: data.email || email,
        name: data.name || 'Administrator',
        role: data.role,
        active: Boolean(data.active),
      });

      // Mark session as unlocked
      sessionStorage.setItem('omove_admin_session_unlocked', 'true');
      setIsAdminUnlocked(true);
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      let msg = 'Authentication failed. Please verify your email and password.';
      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password') || err.message.includes('auth/user-not-found')) {
          msg = 'Invalid email or password.';
        } else if (err.message.includes('auth/too-many-requests')) {
          msg = 'Too many failed login attempts. Please try again later.';
        } else {
          msg = err.message;
        }
      }
      setError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, pass: string, name: string): Promise<boolean> => {
    isExplicitLogout.current = false;
    setError(null);
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const uid = cred.user.uid;

      // Create admin document with required fields
      await setDoc(doc(db, 'admin', uid), {
        email: email.trim(),
        name: name.trim() || 'Administrator',
        role: 'admin',
        active: true,
      });

      setAdminProfile({
        uid,
        email: email.trim(),
        name: name.trim() || 'Administrator',
        role: 'admin',
        active: true,
      });

      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
      setIsLoading(false);
      return false;
    }
  };

  const bootstrapAdminDoc = async (uid: string, email: string, name: string) => {
    try {
      await setDoc(doc(db, 'admin', uid), {
        email: email.trim(),
        name: name.trim() || 'Workforce Administrator',
        role: 'admin',
        active: true,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to bootstrap admin doc:', err);
    }
  };

  const logout = async () => {
    isExplicitLogout.current = true;
    sessionStorage.removeItem('omove_admin_session_unlocked');
    setIsAdminUnlocked(false);
    await signOut(auth);
    setAdminProfile(null);
    setCurrentUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  const isAdmin = Boolean(
    isAdminUnlocked &&
    currentUser && 
    adminProfile && 
    adminProfile.role === 'admin' && 
    adminProfile.active === true
  );

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        isAdmin,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        bootstrapAdminDoc,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
