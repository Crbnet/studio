"use client";

import { useState, useMemo, useCallback } from 'react';
import type { Shift, Store, UserData } from '@/types';
import { ShiftForm } from '@/components/app/shift-form';
import { ShiftsTable } from '@/components/app/shifts-table';
import { SummaryCards } from '@/components/app/summary-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CalendarDays, PoundSterling, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, addDays, subDays, isWithinInterval, parseISO, getDay, startOfDay, subWeeks, addWeeks, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUserData } from '@/hooks/use-user-data';
import { useToast } from '@/hooks/use-toast';

// This component now only handles pay-related settings.
function PaySettings({ payRate, lastPayday, onUpdate }: { payRate: number; lastPayday: string | null; onUpdate: (data: Partial<UserData>) => void; }) {
  const nextPayday = useMemo(() => {
    if (!lastPayday) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextPaydayDate = parseISO(lastPayday);
    nextPaydayDate.setHours(0, 0, 0, 0);

    while (nextPaydayDate <= today) {
      nextPaydayDate.setDate(nextPaydayDate.getDate() + 28);
    }

    return nextPaydayDate;
  }, [lastPayday]);

  const handleSetPayRate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newRate = parseFloat(new FormData(e.currentTarget).get('payRate') as string);
    if (!isNaN(newRate)) {
      onUpdate({ payRate: newRate });
    }
  };

  const handleSetLastPayday = (date: Date | undefined) => {
    if (date) {
      onUpdate({ lastPayday: date.toISOString() });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pay Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPayRate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payRate">Hourly Rate (£)</Label>
              <div className="relative">
                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="payRate" name="payRate" type="number" step="0.01" placeholder="e.g., 12.21" defaultValue={payRate > 0 ? payRate : ''} className="pl-8" required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Set Rate</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Pay Cycle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Last Payday (4-week cycle)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal mt-2",
                    !lastPayday && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastPayday ? format(parseISO(lastPayday), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastPayday ? parseISO(lastPayday) : undefined}
                  onSelect={handleSetLastPayday}
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                  weekStartsOn={1}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {nextPayday && (
            <div className="space-y-2 rounded-md bg-accent/20 p-4">
              <p className="text-sm font-medium text-accent-foreground/80">Next Estimated Payday</p>
              <p className="text-xl font-bold font-headline text-accent-foreground flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {format(nextPayday, "PPP")}
              </p>
            </div>
          )}
          {!lastPayday && (
            <p className="text-sm text-muted-foreground pt-2">Set your last payday to estimate the next one.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

// This component handles shifts and stores logic.
function ShiftManager({
  shifts = [],
  stores = [],
  homeStoreId,
  payRate,
  onUpdate
}: {
  shifts: Shift[];
  stores: Store[];
  homeStoreId?: string | null;
  payRate: number;
  onUpdate: (data: Partial<UserData>) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const weekStartsOn = 1; // Monday
  const weekStart = useMemo(() => startOfWeek(viewDate, { weekStartsOn }), [viewDate]);
  const weekEnd = useMemo(() => endOfWeek(viewDate, { weekStartsOn }), [viewDate]);

  const visibleShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      shiftDate.setHours(12); // avoid timezone issues
      return isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [shifts, weekStart, weekEnd]);
  
  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    const updatedShifts = [...shifts, { ...newShift, id: crypto.randomUUID() }];
    onUpdate({ shifts: updatedShifts });
  };

  const handleDeleteShift = (id: string) => {
    const updatedShifts = shifts.filter(shift => shift.id !== id);
    onUpdate({ shifts: updatedShifts });
  };
  
  const handleAddStore = (newStore: Omit<Store, 'id'>) => {
    const updatedStores = [...stores, { ...newStore, id: crypto.randomUUID() }];
    onUpdate({ stores: updatedStores });
  };

  const handleDeleteStore = (id: string) => {
    const updatedStores = stores.filter(store => store.id !== id);
    const updatedShifts = shifts.map(shift => shift.storeId === id ? { ...shift, storeId: undefined } : shift);
    let newHomeStoreId = homeStoreId;
    if (homeStoreId === id) {
        newHomeStoreId = null;
    }
    onUpdate({ stores: updatedStores, shifts: updatedShifts, homeStoreId: newHomeStoreId });
  };

  const handleSetHomeStore = (storeId: string) => {
    onUpdate({ homeStoreId: storeId });
  }
  
  const isLocked = useMemo(() => {
    const today = startOfDay(new Date());
    const weekStartsOn = 1; // Monday
    const currentWeekStart = startOfWeek(today, { weekStartsOn });
    const viewingWeekStart = startOfWeek(viewDate, { weekStartsOn });
    const nextWeekStart = startOfWeek(addWeeks(today, 1), { weekStartsOn });

    // Allow current week and next week
    if (viewingWeekStart.getTime() === currentWeekStart.getTime() || viewingWeekStart.getTime() === nextWeekStart.getTime()) {
      return false;
    }
    
    // Special case for Monday: allow editing the previous week
    const isMonday = getDay(today) === 1;
    const previousWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn });
    if (isMonday && viewingWeekStart.getTime() === previousWeekStart.getTime()) {
      return false;
    }

    // Lock all other weeks (past and future beyond next week)
    return true;
  }, [viewDate]);


  const grossPayForWeek = useMemo(() => {
    return visibleShifts.reduce((total, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if(durationHours < 0) durationHours += 24; // Handles overnight shifts
      const breakHours = shift.breakDuration / 60;
      const workHours = durationHours - breakHours;
      const IN_CHARGE_BONUS = 0.25;
      const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
      return total + (workHours * hourlyRate);
    }, 0);
  }, [visibleShifts, payRate]);

  return (
    <div className="space-y-6">
       <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-headline">Weekly View</h2>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setViewDate(subDays(viewDate, 7))}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setViewDate(new Date())}>Today</Button>
                <Button variant="outline" size="icon" onClick={() => setViewDate(addDays(viewDate, 7))}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <p className="text-center text-lg font-medium text-muted-foreground">
            {format(weekStart, 'PPP')} &mdash; {format(weekEnd, 'PPP')}
        </p>
        <SummaryCards shifts={visibleShifts} payRate={payRate} stores={stores} />
      </div>

       <div className="lg:col-span-1 space-y-6">
          <ShiftForm
            onAddShift={handleAddShift}
            isLocked={isLocked}
            viewDate={viewDate}
            stores={stores}
            homeStoreId={homeStoreId}
            onAddStore={handleAddStore}
            onDeleteStore={handleDeleteStore}
            onSetHomeStore={handleSetHomeStore}
          />
        </div>

        <div className="lg:col-span-2">
          <ShiftsTable 
            shifts={visibleShifts} 
            allShifts={shifts} 
            stores={stores} 
            payRate={payRate} 
            onDeleteShift={handleDeleteShift} 
            grossPay={grossPayForWeek} 
            isLocked={isLocked} 
          />
        </div>
    </div>
  )
}


export function Dashboard() {
  const { userData, loading, updateUserData } = useUserData();
  const { toast } = useToast();
  
  const handleUpdate = useCallback(async (data: Partial<UserData>) => {
    try {
      await updateUserData(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
      console.error(error);
    }
  }, [updateUserData, toast]);

  if (loading) {
     return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!userData) {
    return <div className="text-center p-8">No user data found.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <PaySettings 
                payRate={userData.payRate} 
                lastPayday={userData.lastPayday} 
                onUpdate={handleUpdate} 
            />
        </div>
        <div className="lg:col-span-2">
            <ShiftManager 
                shifts={userData.shifts} 
                stores={userData.stores}
                homeStoreId={userData.homeStoreId}
                payRate={userData.payRate}
                onUpdate={handleUpdate} 
            />
        </div>
    </div>
  );
}
