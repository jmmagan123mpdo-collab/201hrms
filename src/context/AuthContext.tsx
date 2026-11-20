import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Employee, HRStaffPermission } from '../types/index.ts';
import { INITIAL_ACCOUNTS, INITIAL_EMPLOYEES } from '../data/initialData.ts';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ALL_HR_PERMISSIONS: HRStaffPermission[] = [
  'view_employees',
  'add_employees',
  'edit_employees',
  'upload_documents',
  'scan_documents',
  'verify_documents',
  'request_documents',
  'process_leave',
  'process_wellness',
  'generate_reports',
  'manage_offices'
];

interface AuthContextType {
  currentUser: UserAccount | null;
  currentEmployee: Employee | null;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  activePortal: 'landing' | 'hr' | 'ess';
  setActivePortal: (portal: 'landing' | 'hr' | 'ess') => void;
  loginHR: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginESS: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (portal: 'hr' | 'ess') => Promise<{ success: boolean; error?: string }>;
  registerESS: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activePortal, setActivePortal] = useState<'landing' | 'hr' | 'ess'>('landing');

  // Firebase Authentication is the source of truth. Do not trust cached browser roles.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);
      if (!user) {
        setCurrentUser(null);
        setActivePortal('landing');
        return;
      }
      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (!profileSnap.exists()) {
          setCurrentUser(null);
          await signOut(auth);
          return;
        }
        const profile = profileSnap.data();
        if (profile.isActive === false || !profile.role) {
          setCurrentUser(null);
          await signOut(auth);
          return;
        }
        const role = profile.role as UserRole;
        const resolved: UserAccount = {
          uid: user.uid,
          username: String(profile.username || user.email?.split('@')[0] || ''),
          email: String(profile.email || user.email || ''),
          displayName: String(profile.displayName || user.displayName || user.email || 'User'),
          role,
          employeeId: profile.employeeId ? String(profile.employeeId) : undefined,
          permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
          isActive: true,
          createdAt: String(profile.createdAt || new Date().toISOString()),
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(resolved);
        setActivePortal(role === 'employee' ? 'ess' : 'hr');
      } catch (error) {
        console.error('Unable to load authenticated user profile:', error);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Find linked employee record if any
  const currentEmployee = currentUser?.employeeId
    ? INITIAL_EMPLOYEES.find(e => e.id === currentUser.employeeId) || null
    : null;

  const authenticate = async (emailInput: string, password: string, rememberMe: boolean, portal: 'hr' | 'ess'): Promise<{ success: boolean; error?: string }> => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !password) return { success: false, error: 'Enter your registered email address and password.' };
    if (!email.includes('@')) return { success: false, error: 'For secure Firebase sign-in, use your HR-verified email address. Username sign-in requires a secure server-side username lookup that has not yet been configured.' };
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', credential.user.uid));
      if (!snap.exists()) {
        await signOut(auth);
        return { success: false, error: 'Your Firebase login exists, but HR has not provisioned an SJHR201 account profile. Contact the HR Administrator.' };
      }
      const profile = snap.data();
      const role = profile.role as UserRole;
      const isEmployee = role === 'employee';
      if (profile.isActive === false) {
        await signOut(auth);
        return { success: false, error: 'This account is inactive. Contact the HR Administrator.' };
      }
      if ((portal === 'ess' && !isEmployee) || (portal === 'hr' && isEmployee)) {
        await signOut(auth);
        return { success: false, error: portal === 'ess' ? 'This account is not an Employee Self-Service account.' : 'This employee account cannot access HR Management.' };
      }
      const resolved: UserAccount = {
        uid: credential.user.uid,
        username: String(profile.username || email.split('@')[0]),
        email: String(profile.email || credential.user.email || email),
        displayName: String(profile.displayName || credential.user.displayName || email),
        role,
        employeeId: profile.employeeId ? String(profile.employeeId) : undefined,
        permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
        isActive: true,
        createdAt: String(profile.createdAt || new Date().toISOString()),
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(resolved);
      setActivePortal(portal);
      return { success: true };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/user-disabled': 'This Firebase account has been disabled.',
        'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
        'auth/network-request-failed': 'Network connection failed. Check your internet connection.'
      };
      return { success: false, error: messages[code || ''] || (error instanceof Error ? error.message : 'Sign-in failed.') };
    }
  };

  const loginHR = (email: string, password: string, rememberMe = true) => authenticate(email, password, rememberMe, 'hr');
  const loginESS = (email: string, password: string, rememberMe = true) => authenticate(email, password, rememberMe, 'ess');

  const loginWithGoogle = async (_portal: 'hr' | 'ess'): Promise<{ success: boolean; error?: string }> => ({ success: false, error: 'Google sign-in is disabled. Use your HR-verified email address and password.' });

  const registerESS = async (_email: string, _username: string, _password: string): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'ESS self-registration is not enabled yet. HR must first verify the employee email and provision the employee account securely.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActivePortal('landing');
    signOut(auth).catch((err) => {
      console.warn('Firebase signOut warning:', err);
    });
  };

  const quickSwitchRole = (_role: UserRole) => { /* Role switching is disabled outside authenticated account login. */ };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'developer' || currentUser.role === 'hr_admin') return true;
    if (currentUser.role === 'hr_staff') {
      return currentUser.permissions.includes(permission as any);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentEmployee,
        firebaseUser,
        isAuthReady,
        activePortal,
        setActivePortal,
        loginHR,
        loginESS,
        loginWithGoogle,
        registerESS,
        logout,
        quickSwitchRole,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
