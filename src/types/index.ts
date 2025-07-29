export interface Store {
  id: string;
  name: string;
  number: string;
  mileage?: number; // Mileage from home
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration: number; // in minutes
  inCharge?: boolean;
  storeId?: string;
  isFuelClaim?: boolean;
}

export interface UserData {
    email: string;
    payRate: number;
    lastPayday: string | null; // Stored as ISO string
    stores: Store[];
    shifts: Shift[]; // This will now represent a subcollection, not a field in the main doc
    homeStoreId?: string | null;
}
