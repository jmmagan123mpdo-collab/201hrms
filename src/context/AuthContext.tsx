import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, Employee } from '../types/index.ts';
import { INITIAL_ACCOUNTS, INITIAL_EMPLOYEES } from '../data/initialData.ts';

interface AuthContextType {
  currentUser: UserAccount | null;
  currentEmployee: Employee | null;
  activePortal: 'landing' | 'hr' | 'ess';
  setActivePortal: (portal: 'landing' | 'hr' | 'ess') => void;
  loginHR: (username: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginESS: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  registerESS: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ACCOUNTS_KEY = 'sjhr201_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  // Always start signed out. Every visit and refresh begins at the public landing page.
  // User sessions are intentionally not restored from localStorage.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [activePortal, setActivePortal] = useState<'landing' | 'hr' | 'ess'>('landing');

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  // Do not persist or automatically restore authenticated users.
  // Successful login handlers explicitly select the appropriate portal.

  // Find linked employee record if any
  const currentEmployee = currentUser?.employeeId 
    ? INITIAL_EMPLOYEES.find(e => e.id === currentUser.employeeId) || null 
    : null;

  const loginHR = async (username: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    const cleanUser = username.trim().toLowerCase();
    
    // Developer, HR Admin, HR Staff, or Payroll
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

    // Passwords check
    // In production, password verification is done via auth service / hashed comparisons.
    // For demo/system access we accept either default passwords or developer bypass
    const validPasswords: Record<string, string> = {
      'dev_sanjose': 'developer2026!',
      'hr_admin': 'admin2026!',
      'hr_staff': 'staff2026!',
      'payroll_officer': 'payroll2026!'
    };

    if (password !== 'admin123' && validPasswords[account.username] && password !== validPasswords[account.username]) {
      return { success: false, error: 'Incorrect password. Please verify your credentials or use the default access.' };
    }

    const updatedAccount = {
      ...account,
      lastLogin: new Date().toISOString()
    };

    setCurrentUser(updatedAccount);
    setActivePortal('hr');
    return { success: true };
  };

  const loginESS = async (identifier: string, password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Look for employee account matching either registered email or username
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

    // Default password or demo password
    if (password !== 'employee123' && password !== 'employee2026!' && password.length < 4) {
      return { success: false, error: 'Invalid password. (Default demo password is: employee2026!)' };
    }

    setCurrentUser(account);
    setActivePortal('ess');
    return { success: true };
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

    // 1. Verify that email exists in employee masterlist and is registered by HR
    const matchedEmployee = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === cleanEmail);
    if (!matchedEmployee) {
      return { 
        success: false, 
        error: 'Email address not found in the official HR personnel registry. Please submit your official email address to the HR Office for recording.' 
      };
    }

    // 2. Check if this employee already has an ESS account
    const existingForEmployee = accounts.find(a => a.employeeId === matchedEmployee.id);
    if (existingForEmployee) {
      return { 
        success: false, 
        error: `An ESS account already exists for this personnel record (Username: ${existingForEmployee.username}). Use Forgot Password if needed.` 
      };
    }

    // 3. Check if username is already taken
    const usernameTaken = accounts.find(a => a.username.toLowerCase() === cleanUsername);
    if (usernameTaken) {
      return { success: false, error: 'This username is already taken. Please choose another username.' };
    }

    // 4. Create new ESS account linked to the employee's permanent internal ID
    const newAccount: UserAccount = {
      uid: `usr-ess-${Date.now()}`,
      username: cleanUsername,
      email: matchedEmployee.email,
      displayName: `${matchedEmployee.firstName} ${matchedEmployee.lastName}`,
      role: 'employee',
      employeeId: matchedEmployee.id, // Immutable link
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
  };

  const quickSwitchRole = (role: UserRole) => {
    const targetAccount = accounts.find(a => a.role === role);
    if (targetAccount) {
      setCurrentUser(targetAccount);
      if (role === 'employee') {
        setActivePortal('ess');
      } else {
        setActivePortal('hr');
      }
    }
  };

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
        activePortal,
        setActivePortal,
        loginHR,
        loginESS,
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
