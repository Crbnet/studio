"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { UserData } from '@/types';
import { useToast } from './use-toast';

interface UserDataContextType {
  userData: UserData | null;
  loading: boolean;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, 
        async (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // This case can be hit if the user document wasn't created on signup for some reason.
            // Let's ensure it's created.
            console.log("No such document! Creating one for user:", user.uid);
            const initialData: UserData = {
              email: user.email || '',
              payRate: 12.21,
              lastPayday: null,
              stores: [],
              shifts: [],
              homeStoreId: null,
            };
            await setDoc(userDocRef, initialData);
            setUserData(initialData);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching user data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your data. Please refresh the page.",
          });
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // No user, clear data and loading state
      setUserData(null);
      setLoading(false);
    }
  }, [user, toast]);

  const updateUserData = useCallback(async (data: Partial<UserData>) => {
    if (!user) {
      throw new Error("No user is signed in to update data.");
    }
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, data);
  }, [user]);

  return (
    <UserDataContext.Provider value={{ userData, loading, updateUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
