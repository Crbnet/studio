import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { Shift, Store, UserData } from '@/types';

export const getUserData = async (): Promise<UserData | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  } else {
    // This case should ideally not be hit if user is created properly on signup
    console.log("No such document! Creating one.");
    const initialData: UserData = {
      email: user.email || '',
      payRate: 12.21,
      lastPayday: null,
      stores: [],
      shifts: [],
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
