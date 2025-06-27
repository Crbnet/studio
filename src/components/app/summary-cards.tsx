"use client";

import { useMemo } from 'react';
import type { Shift } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PoundSterling, Clock, TrendingUp, BarChart } from 'lucide-react';

interface SummaryCardsProps {
  shifts: Shift[];
  payRate: number;
}

const IN_CHARGE_BONUS = 0.25;

export function SummaryCards({ shifts, payRate }: SummaryCardsProps) {
    const { totalHours, grossPay } = useMemo(() => {
        let totalHours = 0;
        let grossPay = 0;

        shifts.forEach(shift => {
            const start = new Date(`${shift.date}T${shift.startTime}`);
            const end = new Date(`${shift.date}T${shift.endTime}`);
            let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if(durationHours < 0) durationHours += 24; // Handles overnight shifts
            const breakHours = shift.breakDuration / 60;
            const workHours = durationHours - breakHours;
            const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
            totalHours += workHours;
            grossPay += workHours * hourlyRate;
        });
        
        return { totalHours, grossPay };
    }, [shifts, payRate]);

    const avgPayPerShift = shifts.length > 0 ? grossPay / shifts.length : 0;
    const avgHoursPerShift = shifts.length > 0 ? totalHours / shifts.length : 0;


  const summaryData = [
    { title: 'Weekly Hours', value: totalHours.toFixed(2), icon: Clock, change: 'h' },
    { title: 'Weekly Gross Pay', value: `£${grossPay.toFixed(2)}`, icon: PoundSterling, change: '' },
    { title: 'Avg Pay/Shift', value: `£${avgPayPerShift.toFixed(2)}`, icon: TrendingUp, change: '' },
    { title: 'Avg Hours/Shift', value: avgHoursPerShift.toFixed(2), icon: BarChart, change: 'h' },
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
            <p className="text-xs text-muted-foreground">For the selected week</p>
        </CardContent>
        </Card>
    ))}
    </div>
  );
}
