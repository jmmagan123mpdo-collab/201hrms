import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Employee, HRStaffPermission } from '../types/index.ts';
import { INITIAL_ACCOUNTS, INITIAL_EMPLOYEES } from '../data/initialData.ts';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
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

const LOCAL_STORAGE_USER_KEY = 'sjhr201_auth_user';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'sjhr201_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activePortal, setActivePortal] = useState<'landing' | 'hr' | 'ess'>('landing');

  // Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
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

  const loginHR = async (username: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();

    const account = accounts.find(a =>
      (a.username.toLowerCase() === cleanUser || a.email.toLowerCase() === cleanUser) &&
      a.role !== 'employee'
    );

    if (!account) {
      return { success: false, error: 'Invalid HR Management credentials or unauthorized account.' };
    }

    if (!account.isActive) {
      return { success: false, error: 'This HR account has been deactivated. Please contact the HR Administrator.' };
    }

    return { success: false, error: 'No password-based account authentication is configured. Create and enable an account through the approved authentication setup.' };
  };

  const loginESS = async (identifier: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();

    const account = accounts.find(a =>
      a.role === 'employee' &&
      (a.email.toLowerCase() === cleanId || a.username.toLowerCase() === cleanId)
    );

    if (!account) {
      return {
        success: false,
        error: 'No ESS account found with this email or username. Please ensure your email is recorded by HR and register an ESS account.'
      };
    }

    if (!account.isActive) {
      return { success: false, error: 'This ESS account is currently inactive. Please contact HR.' };
    }

    return { success: false, error: 'ESS password authentication is not configured. Please complete account provisioning first.' };
  };

  const loginWithGoogle = async (portal: 'hr' | 'ess'): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const credential = await signInWithPopup(auth, provider);
      const fbUser = credential.user;
      const fbEmail = (fbUser.email || '').trim().toLowerCase();

      if (!fbEmail) {
        return { success: false, error: 'Google account did not return a verified email address.' };
      }

      // Sync or read /users/{uid} record in Cloud Firestore
      let remoteRole: UserRole | null = null;
      let remoteEmployeeId: string | undefined;
      const userDocPath = `users/${fbUser.uid}`;

      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data?.role) remoteRole = data.role as UserRole;
          if (data?.employeeId) remoteEmployeeId = String(data.employeeId);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userDocPath);
      }

      const isBootstrappedAdmin = false;
      const matchedEmployee = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === fbEmail);
      const existingAccount = accounts.find(a => a.email.toLowerCase() === fbEmail);

      let resolvedUser: UserAccount | null = null;

      if (portal === 'hr') {
        if (isBootstrappedAdmin) {
          resolvedUser = {
            uid: fbUser.uid,
            username: fbEmail.split('@')[0],
            email: fbEmail,
            displayName: fbUser.displayName || 'Lead System Developer & Supervisor',
            role: 'developer',
            permissions: ALL_HR_PERMISSIONS,
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        } else if (existingAccount && existingAccount.role !== 'employee') {
          resolvedUser = {
            ...existingAccount,
            uid: fbUser.uid,
            displayName: fbUser.displayName || existingAccount.displayName,
            lastLogin: new Date().toISOString()
          };
        } else if (remoteRole && remoteRole !== 'employee') {
          resolvedUser = {
            uid: fbUser.uid,
            username: fbEmail.split('@')[0],
            email: fbEmail,
            displayName: fbUser.displayName || fbEmail,
            role: remoteRole,
            permissions: remoteRole === 'hr_admin' || remoteRole === 'developer' ? ALL_HR_PERMISSIONS : ['view_employees', 'process_leave', 'process_wellness'],
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        } else if (currentUser && currentUser.role !== 'employee') {
          // Linking Firebase Google session onto an already authenticated HR portal session
          resolvedUser = {
            ...currentUser,
            lastLogin: new Date().toISOString()
          };
        } else {
          return {
            success: false,
            error: `Google account (${fbEmail}) is not authorized for HR Management. Ask the system administrator to create and authorize your HR account first.`
          };
        }
      } else {
        // ESS Portal
        if (matchedEmployee) {
          resolvedUser = {
            uid: fbUser.uid,
            username: matchedEmployee.essUsername || fbEmail.split('@')[0],
            email: matchedEmployee.email,
            displayName: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
            role: 'employee',
            employeeId: matchedEmployee.id,
            permissions: [],
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        } else if (existingAccount && existingAccount.role === 'employee') {
          resolvedUser = {
            ...existingAccount,
            uid: fbUser.uid,
            lastLogin: new Date().toISOString()
          };
        } else if (remoteEmployeeId) {
          resolvedUser = {
            uid: fbUser.uid,
            username: fbEmail.split('@')[0],
            email: fbEmail,
            displayName: fbUser.displayName || fbEmail,
            role: 'employee',
            employeeId: remoteEmployeeId,
            permissions: [],
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };
        } else if (currentUser && currentUser.role === 'employee') {
          resolvedUser = {
            ...currentUser,
            lastLogin: new Date().toISOString()
          };
        } else {
          return {
            success: false,
            error: `Google email (${fbEmail}) is not registered in the LGU Employee Masterlist. Sign in with an ESS account or have HR record this email.`
          };
        }
      }

      // Persist /users/{uid} record in Firestore
      try {
        await setDoc(
          doc(db, 'users', fbUser.uid),
          {
            uid: fbUser.uid,
            email: fbEmail,
            displayName: fbUser.displayName || resolvedUser.displayName,
            role: isBootstrappedAdmin ? 'developer' : (remoteRole || resolvedUser.role),
            ...(resolvedUser.employeeId ? { employeeId: resolvedUser.employeeId } : {}),
            lastLoginAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userDocPath);
      }

      setCurrentUser(resolvedUser);
      setActivePortal(portal);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
      if (message.includes('popup-closed-by-user')) {
        return { success: false, error: 'Google Sign-In popup was closed before completing authentication.' };
      }
      return { success: false, error: message };
    }
  };

  const registerESS = async (email: string, username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanEmail || !cleanUsername || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    const matchedEmployee = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === cleanEmail);
    if (!matchedEmployee) {
      return {
        success: false,
        error: 'Email address not found in the official HR personnel registry. Please submit your official email address to the HR Office for recording.'
      };
    }

    const existingForEmployee = accounts.find(a => a.employeeId === matchedEmployee.id);
    if (existingForEmployee) {
      return {
        success: false,
        error: `An ESS account already exists for this personnel record (Username: ${existingForEmployee.username}). Use Forgot Password if needed.`
      };
    }

    const usernameTaken = accounts.find(a => a.username.toLowerCase() === cleanUsername);
    if (usernameTaken) {
      return { success: false, error: 'This username is already taken. Please choose another username.' };
    }

    const newAccount: UserAccount = {
      uid: `usr-ess-${Date.now()}`,
      username: cleanUsername,
      email: matchedEmployee.email,
      displayName: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
      role: 'employee',
      employeeId: matchedEmployee.id,
      permissions: [],
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newAccount]);
    setCurrentUser(newAccount);
    setActivePortal('ess');

    return { success: true };
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
