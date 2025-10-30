import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (
    email: string,
    password: string,
    userData: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      dateOfBirth?: string;
    }
  ) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const userData = await AuthService.signIn(email, password);
    setUser(userData);
    return userData;
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      dateOfBirth?: string;
    }
  ): Promise<User> => {
    const newUser = await AuthService.register(email, password, userData);
    setUser(newUser);
    return newUser;
  };

  const signOut = async (): Promise<void> => {
    await AuthService.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await AuthService.resetPassword(email);
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    await AuthService.updateProfile(user.id, updates);
    setUser({ ...user, ...updates });
  };

  const updateEmail = async (newEmail: string): Promise<void> => {
    if (!user) throw new Error('No authenticated user');
    await AuthService.updateUserEmail(newEmail);
    setUser({ ...user, email: newEmail });
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    await AuthService.updateUserPassword(newPassword);
  };

  const deleteAccount = async (): Promise<void> => {
    await AuthService.deleteAccount();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
