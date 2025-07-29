import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, collection } from 'firebase/firestore';
import type { UserData, Shift } from '@/types';

// This function is kept for cases where a non-realtime fetch might be needed,
// but the primary data flow will now use the real-time listener in use-user-data.tsx.
export const getUserData = async (): Promise<Omit<UserData, 'shifts'> | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { shifts, ...restOfData } = docSnap.data() as UserData;
    return restOfData;
  } else {
    console.log("No such document! Creating one.");
    const initialData: UserData = {
      email: user.email || '',
      payRate: 12.21,
      lastPayday: null,
      stores: [],
      shifts: [],
      homeStoreId: null,
    };
    await setDoc(docRef, initialData);
    const { shifts, ...restOfData } = initialData;
    return restOfData;
  }
};

export const updateUserData = async (data: Partial<UserData>, newShifts: Shift[] = []): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in to update data.");

  const batch = writeBatch(db);
  const userDocRef = doc(db, "users", user.uid);

  // Update the main user document
  const { shifts, ...userDataToUpdate } = data;
  if (Object.keys(userDataToUpdate).length > 0) {
      batch.update(userDocRef, userDataToUpdate);
  }
  
  // Add new shifts to the subcollection
  const allShifts = [...(shifts || []), ...newShifts];
  if (allShifts.length > 0) {
    allShifts.forEach(shift => {
        const shiftDocRef = doc(db, `users/${user.uid}/shifts`, shift.id);
        batch.set(shiftDocRef, shift);
    });
  }

  await batch.commit();
};

export const deleteUserData = async (uid: string): Promise<void> => {
    // This now needs to delete the user document AND the shifts subcollection.
    // This is a more complex operation, often best handled by a Cloud Function for atomicity.
    // For the client-side, we can delete the document, but the subcollection will be orphaned.
    const userDocRef = doc(db, "users", uid);
    await deleteDoc(userDocRef);
};
