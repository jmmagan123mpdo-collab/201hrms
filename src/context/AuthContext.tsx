import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Employee, HRStaffPermission } from '../types/index.ts';
import { INITIAL_ACCOUNTS, INITIAL_EMPLOYEES } from '../data/initialData.ts';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

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

const LOCAL_STORAGE_USER_KEY = 'sjhr201_auth_user';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'sjhr201_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activePortal, setActivePortal] = useState<'landing' | 'hr' | 'ess'>('landing');

  // Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            const d = snap.data();
            setCurrentUser({ uid: user.uid, username: String(d.username || user.email?.split('@')[0] || ''), email: String(d.email || user.email || ''), displayName: String(d.displayName || user.displayName || ''), role: d.role as UserRole, employeeId: d.employeeId ? String(d.employeeId) : undefined, permissions: Array.isArray(d.permissions) ? d.permissions : [], isActive: d.isActive !== false, createdAt: String(d.createdAt || new Date().toISOString()) });
          } else { setCurrentUser(null); }
        } catch { setCurrentUser(null); }
      } else { setCurrentUser(null); }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
      if (currentUser.role === 'employee') {
        setActivePortal('ess');
      } else {
        setActivePortal('hr');
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }, [currentUser]);

  // Find linked employee record if any
  const currentEmployee = currentUser?.employeeId
    ? INITIAL_EMPLOYEES.find(e => e.id === currentUser.employeeId) || null
    : null;

  const authenticateAccount = async (identifier: string, password: string, portal: 'hr' | 'ess', rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    const clean = identifier.trim().toLowerCase();
    if (!clean || !password) return { success: false, error: 'Enter your username/email and password.' };
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      let email = clean;
      if (!clean.includes('@')) {
        const accountQuery = query(collection(db, 'users'), where('usernameLower', '==', clean));
        const matches = await getDocs(accountQuery);
        if (matches.empty) return { success: false, error: 'Account not found. Use your registered email or contact the System Developer.' };
        email = String(matches.docs[0].data().email || '').toLowerCase();
      }
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profileRef = doc(db, 'users', credential.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await signOut(auth);
        return { success: false, error: 'Your account has no authorized SJHR201 role profile. Contact the System Developer.' };
      }
      const profile = profileSnap.data();
      const role = profile.role as UserRole;
      const isEmployee = role === 'employee';
      if ((portal === 'hr' && isEmployee) || (portal === 'ess' && !isEmployee)) {
        await signOut(auth);
        return { success: false, error: portal === 'hr' ? 'This account is not authorized for HR Management.' : 'This account is not an ESS employee account.' };
      }
      if (profile.isActive === false) {
        await signOut(auth);
        return { success: false, error: 'This account is deactivated. Contact the System Developer or HR Administrator.' };
      }
      const resolved: UserAccount = {
        uid: credential.user.uid,
        username: String(profile.username || email.split('@')[0]),
        email,
        displayName: String(profile.displayName || credential.user.displayName || email),
        role,
        employeeId: profile.employeeId ? String(profile.employeeId) : undefined,
        permissions: Array.isArray(profile.permissions) ? profile.permissions : [],
        isActive: profile.isActive !== false,
        lastLogin: new Date().toISOString(),
        createdAt: String(profile.createdAt || new Date().toISOString())
      };
      await setDoc(profileRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      setCurrentUser(resolved);
      setActivePortal(portal);
      return { success: true };
    } catch (error: any) {
      const code = error?.code || '';
      const message = code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
        ? 'Invalid username/email or password.'
        : code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later.'
        : (error instanceof Error ? error.message : 'Authentication failed.');
      return { success: false, error: message };
    }
  };

  const loginHR = (username: string, password: string, rememberMe = true) => authenticateAccount(username, password, 'hr', rememberMe);
  const loginESS = (identifier: string, password: string, rememberMe = true) => authenticateAccount(identifier, password, 'ess', rememberMe);

  const loginWithGoogle = async (_portal: 'hr' | 'ess'): Promise<{ success: boolean; error?: string }> => ({
    success: false,
    error: 'Google sign-in is disabled. Use your authorized SJHR201 username/email and password.'
  });

  const registerESS = async (_email: string, _username: string, _password: string): Promise<{ success: boolean; error?: string }> => ({
    success: false,
    error: 'Public ESS registration is disabled. ESS accounts must be provisioned by authorized HR personnel.'
  });

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
    if (currentUser.role === 'mayor' || currentUser.role === 'department_head' || currentUser.role === 'division_head' || currentUser.role === 'payroll') return currentUser.permissions.includes(permission as any);
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
