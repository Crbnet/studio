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
import { PoundSterling } from 'lucide-react';

export function Dashboard() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payRate, setPayRate] = useState<number>(0);

  useEffect(() => {
    try {
      const storedShifts = localStorage.getItem('shifts');
      const storedPayRate = localStorage.getItem('payRate');
      if (storedShifts) {
        setShifts(JSON.parse(storedShifts));
      }
      if (storedPayRate) {
        setPayRate(JSON.parse(storedPayRate));
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
  }

  const grossPay = useMemo(() => {
    return shifts.reduce((total, shift) => {
      const start = new Date(`${shift.date}T${shift.startTime}`);
      const end = new Date(`${shift.date}T${shift.endTime}`);
      let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if(durationHours < 0) durationHours += 24; // Handles overnight shifts
      const breakHours = shift.breakDuration / 60;
      const workHours = durationHours - breakHours;
      return total + (workHours * payRate);
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
          <ShiftForm onAddShift={handleAddShift} />
        </div>

        <div className="lg:col-span-2">
          <ShiftsTable shifts={shifts} payRate={payRate} onDeleteShift={handleDeleteShift} grossPay={grossPay} />
        </div>
      </div>
    </div>
  );
}
