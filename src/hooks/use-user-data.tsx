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
    
    const hasDataUpdates = Object.keys(data).length > 0;
    const hasShiftUpdates = newShifts.length > 0 || deletedShiftIds.length > 0;

    if (!hasDataUpdates && !hasShiftUpdates) {
      return; 
    }
    
    const batch = writeBatch(db);
    const userDocRef = doc(db, "users", user.uid);
    
    if (hasDataUpdates) {
      const cleanData: { [key: string]: any } = {};
      Object.keys(data).forEach(key => {
          const typedKey = key as keyof typeof data;
          if (data[typedKey] !== undefined) {
              cleanData[key] = data[typedKey];
          }
      });
      batch.update(userDocRef, cleanData);
    }
    
    newShifts.forEach(shift => {
      const shiftDocRef = doc(db, `users/${user.uid}/shifts`, shift.id);
      batch.set(shiftDocRef, shift);
    });

    deletedShiftIds.forEach(id => {
        const shiftDocRef = doc(db, `users/${user.uid}/shifts`, id);
        batch.delete(shiftDocRef);
    });

    await batch.commit();

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
