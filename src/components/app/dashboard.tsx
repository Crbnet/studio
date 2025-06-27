"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Shift } from '@/types';
import { ShiftForm } from '@/components/app/shift-form';
import { ShiftsTable } from '@/components/app/shifts-table';
import { SummaryCards } from '@/components/app/summary-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CalendarDays, PoundSterling } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const IN_CHARGE_BONUS = 0.25;

export function Dashboard() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payRate, setPayRate] = useState<number>(0);
  const [lastPayday, setLastPayday] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const storedShifts = localStorage.getItem('shifts');
      const storedPayRate = localStorage.getItem('payRate');
      const storedLastPayday = localStorage.getItem('lastPayday');
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }
      if (storedPayRate) {
        setPayRate(JSON.parse(storedPayRate));
      }
      if (storedLastPayday) {
        setLastPayday(new Date(JSON.parse(storedLastPayday)));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('payRate', JSON.stringify(payRate));
  }, [payRate]);

  useEffect(() => {
    if (lastPayday) {
      localStorage.setItem('lastPayday', JSON.stringify(lastPayday));
    }
  }, [lastPayday]);

  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    setShifts(prev => [...prev, { ...newShift, id: crypto.randomUUID() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== id));
  };
  
  const handleSetPayRate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newRate = parseFloat(new FormData(e.currentTarget).get('payRate') as string);
    if (!isNaN(newRate)) {
      setPayRate(newRate);
    }
  };

  const handleSetLastPayday = (date: Date | undefined) => {
    if (date) {
      setLastPayday(date);
    }
  };

  const nextPayday = useMemo(() => {
    if (!lastPayday) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextPaydayDate = new Date(lastPayday);
    nextPaydayDate.setHours(0, 0, 0, 0);
    
    while (nextPaydayDate <= today) {
        nextPaydayDate.setDate(nextPaydayDate.getDate() + 28);
    }
    
    return nextPaydayDate;
  }, [lastPayday]);

  const grossPay = useMemo(() => {
    return shifts.reduce((total, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if(durationHours < 0) durationHours += 24; // Handles overnight shifts
      const breakHours = shift.breakDuration / 60;
      const workHours = durationHours - breakHours;
      const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
      return total + (workHours * hourlyRate);
    }, 0);
  }, [shifts, payRate]);

  return (
    <div className="space-y-6">
      <SummaryCards shifts={shifts} payRate={payRate} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
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
                    <Input id="payRate" name="payRate" type="number" step="0.01" placeholder="e.g., 15.50" defaultValue={payRate > 0 ? payRate : ''} className="pl-8" required />
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
                                {lastPayday ? format(lastPayday, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={lastPayday}
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

          <ShiftForm onAddShift={handleAddShift} />
        </div>

        <div className="lg:col-span-2">
          <ShiftsTable shifts={shifts} payRate={payRate} onDeleteShift={handleDeleteShift} grossPay={grossPay} />
        </div>
      </div>
    </div>
  );
}
