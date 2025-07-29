export interface Store {
  id: string;
  name: string;
  number: string;
}

export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakDuration: number; // in minutes
  inCharge?: boolean;
  storeId?: string;
}

export interface UserData {
    email: string;
    payRate: number;
    lastPayday: string | null; // Stored as ISO string
    stores: Store[];
    shifts: Shift[];
}
