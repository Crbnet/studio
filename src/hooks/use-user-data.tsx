"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { UserData, Shift } from '@/types';
import { useToast } from './use-toast';
import { setDoc } from 'firebase/firestore';

interface UserDataContextType {
  userData: Omit<UserData, 'shifts'> | null;
  loading: boolean;
  updateUserData: (data: Partial<Omit<UserData, 'shifts'>>, newShifts?: Shift[], deletedShiftIds?: string[]) => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<Omit<UserData, 'shifts'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const userDocRef = doc(db, 'users', user.uid);
      
      const unsubscribe = onSnapshot(userDocRef, 
        async (docSnap) => {
          if (docSnap.exists()) {
            const { shifts, ...restOfData } = docSnap.data() as UserData;
            setUserData(restOfData);
          } else {
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
            const { shifts, ...restOfData } = initialData;
            setUserData(restOfData);
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

      return () => unsubscribe();
    } else {
      setUserData(null);
      setLoading(false);
    }
  }, [user, toast]);

  const updateUserData = useCallback(async (
    data: Partial<Omit<UserData, 'shifts'>>, 
    newShifts: Shift[] = [], 
    deletedShiftIds: string[] = []
  ) => {
    if (!user) {
      throw new Error("No user is signed in to update data.");
    }
    
    try {
        const batch = writeBatch(db);
        const userDocRef = doc(db, "users", user.uid);

        // Always merge data to ensure we don't overwrite fields unintentionally.
        // The `data` object might contain just `stores` or just `homeStoreId`, etc.
        if (Object.keys(data).length > 0) {
            batch.set(userDocRef, data, { merge: true });
        }
        
        // Add or update new shifts in the subcollection.
        newShifts.forEach(shift => {
          const shiftDocRef = doc(db, `users/${user.uid}/shifts`, shift.id);
          batch.set(shiftDocRef, shift);
        });

        // Delete shifts from the subcollection.
        deletedShiftIds.forEach(id => {
            const shiftDocRef = doc(db, `users/${user.uid}/shifts`, id);
            batch.delete(shiftDocRef);
        });

        await batch.commit();

    } catch (error) {
        console.error("Error updating user data:", error);
        toast({
            variant: "destructive",
            title: "Save Error",
            description: "Your changes could not be saved. Please try again.",
        });
        // Re-throw the error if you want calling components to be able to catch it.
        throw error;
    }

  }, [user, toast]);

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
