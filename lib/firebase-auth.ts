'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser ?? null;
}

/** Resolves when Firebase has finished restoring auth state (e.g. from persistence). */
export function whenAuthReady(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.resolve();
  return auth.authStateReady();
}

export function onAuthStateChange(callback: (user: User | null) => void): (() => void) | void {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return;
  }
  return onAuthStateChanged(auth, callback);
}

export function signUp(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth)
    return Promise.reject(
      new Error(
        'Firebase not loaded. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local (see .env.local.example) and restart the dev server.'
      )
    );
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signIn(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth)
    return Promise.reject(
      new Error(
        'Firebase not loaded. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local (see .env.local.example) and restart the dev server.'
      )
    );
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOut() {
  const auth = getFirebaseAuth();
  if (auth) return firebaseSignOut(auth);
  return Promise.resolve();
}
