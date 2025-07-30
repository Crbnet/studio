"use client";

import { useMemo } from 'react';
import type { Shift, Store } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PoundSterling, Clock, TrendingUp, BarChart, Fuel, CalendarRange } from 'lucide-react';

interface SummaryCardsProps {
  shiftsForWeek: Shift[];
  payRate: number;
  stores: Store[];
  payCycleTotalPay: number;
}

const IN_CHARGE_BONUS = 0.25;
const FUEL_RATE_PER_MILE = 0.30;

export function SummaryCards({ shiftsForWeek, payRate, stores, payCycleTotalPay }: SummaryCardsProps) {
    const { totalHours, grossPay, totalFuel } = useMemo(() => {
        let totalHours = 0;
        let grossPay = 0;
        let totalFuel = 0;

        shiftsForWeek.forEach(shift => {
            const start = new Date(`${shift.date}T${shift.startTime}`);
            const end = new Date(`${shift.date}T${shift.endTime}`);
            let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if(durationHours < 0) durationHours += 24; // Handles overnight shifts
            const breakHours = shift.breakDuration / 60;
            const workHours = durationHours - breakHours;
            const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
            
            totalHours += workHours;
            grossPay += workHours * hourlyRate;

            if (shift.isFuelClaim && shift.storeId) {
                const store = stores.find(s => s.id === shift.storeId);
                if (store && store.mileage) {
                    totalFuel += store.mileage * 2 * FUEL_RATE_PER_MILE;
                }
            }
        });
        
        return { totalHours, grossPay, totalFuel };
    }, [shiftsForWeek, payRate, stores]);

  const summaryData = [
    { title: 'Weekly Hours', value: totalHours.toFixed(2), icon: Clock, description: 'For the selected week' },
    { title: 'Weekly Gross Pay', value: `£${grossPay.toFixed(2)}`, icon: PoundSterling, description: 'For the selected week' },
    { title: 'Weekly Fuel Claim', value: `£${totalFuel.toFixed(2)}`, icon: Fuel, description: 'For the selected week' },
    { title: 'Pay Cycle Total', value: `£${payCycleTotalPay.toFixed(2)}`, icon: CalendarRange, description: 'Running total for this pay period' },
  ];
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {summaryData.map(item => (
        <Card key={item.title}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold font-headline">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
        </CardContent>
        </Card>
    ))}
    </div>
  );
}
