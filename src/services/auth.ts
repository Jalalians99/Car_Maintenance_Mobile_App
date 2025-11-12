import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';
import { User } from '../types';

export class AuthService {
  static async register(
    email: string,
    password: string,
    userData: {
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      dateOfBirth?: string;
    }
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      const user: User = {
        id: firebaseUser.uid,
        username: userData.username,
        email: email.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const firestoreData: any = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (userData.phoneNumber) {
        firestoreData.phoneNumber = userData.phoneNumber;
      }
      if (userData.dateOfBirth) {
        firestoreData.dateOfBirth = userData.dateOfBirth;
      }

      await setDoc(doc(firestore, 'users', firebaseUser.uid), firestoreData);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code, error.message));
    }
  }

  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();
      return {
        ...userData,
        id: firebaseUser.uid,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as User;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code, error.message));
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code, error.message));
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      return {
        ...userData,
        id: firebaseUser.uid,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as User;
    } catch (error) {
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const firebaseUser = auth.currentUser;
      if (firebaseUser && (updates.firstName || updates.lastName)) {
        await updateProfile(firebaseUser, {
          displayName: `${updates.firstName || ''} ${updates.lastName || ''}`.trim(),
        });
      }
    } catch (error: any) {
      throw new Error('Failed to update profile');
    }
  }

  static async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No authenticated user');

      await updateEmail(firebaseUser, newEmail);
      
      const userRef = doc(firestore, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        email: newEmail.toLowerCase(),
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code, error.message));
    }
  }

  static async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No authenticated user');

      await updatePassword(firebaseUser, newPassword);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code, error.message));
    }
  }

  static async deleteAccount(): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No authenticated user');

      await deleteDoc(doc(firestore, 'users', firebaseUser.uid));
      await deleteUser(firebaseUser);
    } catch (error: any) {
      throw new Error('Failed to delete account');
    }
  }

  private static getErrorMessage(errorCode: string, originalMessage?: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/requires-recent-login':
        return 'Please sign in again to perform this action';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection';
      case 'permission-denied':
      case 'PERMISSION_DENIED':
        return 'Database permission denied. Please check Firestore security rules';
      case 'invalid-argument':
        return 'Invalid data provided. Please check all required fields';
      default:
        const debugInfo = originalMessage ? ` (${originalMessage})` : '';
        return `An unexpected error occurred. Please try again${debugInfo}`;
    }
  }
}
