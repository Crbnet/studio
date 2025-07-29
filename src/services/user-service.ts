import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserData } from '@/types';

// This function is kept for cases where a non-realtime fetch might be needed,
// but the primary data flow will now use the real-time listener in use-user-data.tsx.
export const getUserData = async (): Promise<UserData | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  } else {
    console.log("No such document! Creating one.");
    const initialData: UserData = {
      email: user.email || '',
      payRate: 12.21,
      lastPayday: null,
      stores: [],
      shifts: [],
      homeStoreId: undefined,
    };
    await setDoc(docRef, initialData);
    return initialData;
  }
};

export const updateUserData = async (data: Partial<UserData>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in to update data.");

  const userDocRef = doc(db, "users", user.uid);
  await updateDoc(userDocRef, data);
};

export const deleteUserData = async (uid: string): Promise<void> => {
    const userDocRef = doc(db, "users", uid);
    await deleteDoc(userDocRef);
};
