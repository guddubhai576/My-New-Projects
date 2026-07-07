import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export function Auth({ onUserChange }: { onUserChange?: (user: User | null) => void }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (onUserChange) onUserChange(u);
    });
    return () => unsubscribe();
  }, [onUserChange]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {user ? (
        <>
          <div className="flex items-center gap-2 bg-white/5 rounded-full pl-2 pr-4 py-1 border border-white/10">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <UserIcon className="w-3 h-3" />
              </div>
            )}
            <span className="text-xs font-bold text-white/80 max-w-[100px] truncate">{user.displayName || user.email}</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button 
          onClick={handleSignIn}
          className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-full transition-colors uppercase tracking-widest"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      )}
    </div>
  );
}
