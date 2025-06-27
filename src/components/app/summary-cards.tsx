"use client";

import { useMemo } from 'react';
import type { Shift } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PoundSterling, Clock, TrendingUp, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from 'react';
import { subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';

interface SummaryCardsProps {
  shifts: Shift[];
  payRate: number;
}

type Period = 'week' | 'month' | 'all';

export function SummaryCards({ shifts, payRate }: SummaryCardsProps) {
    const [period, setPeriod] = useState<Period>('all');

    const filteredShifts = useMemo(() => {
        const now = new Date();
        if (period === 'all') return shifts;

        const interval = period === 'week' 
            ? { start: startOfWeek(now, { weekStartsOn: 1 }), end: now }
            : { start: startOfMonth(now), end: now };

        return shifts.filter(s => isWithinInterval(new Date(s.date), interval));
    }, [shifts, period]);

    const { totalHours, grossPay } = useMemo(() => {
        let totalHours = 0;
        let grossPay = 0;

        filteredShifts.forEach(shift => {
            const start = new Date(`${shift.date}T${shift.startTime}`);
            const end = new Date(`${shift.date}T${shift.endTime}`);
            let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            if(durationHours < 0) durationHours += 24; // Handles overnight shifts
            const breakHours = shift.breakDuration / 60;
            const workHours = durationHours - breakHours;
            totalHours += workHours;
            grossPay += workHours * payRate;
        });
        
        return { totalHours, grossPay };
    }, [filteredShifts, payRate]);

    const avgPayPerShift = filteredShifts.length > 0 ? grossPay / filteredShifts.length : 0;
    const avgHoursPerShift = filteredShifts.length > 0 ? totalHours / filteredShifts.length : 0;


  const summaryData = [
    { title: 'Total Hours', value: totalHours.toFixed(2), icon: Clock, change: 'h' },
    { title: 'Gross Pay', value: `£${grossPay.toFixed(2)}`, icon: PoundSterling, change: '' },
    { title: 'Avg Pay/Shift', value: `£${avgPayPerShift.toFixed(2)}`, icon: TrendingUp, change: '' },
    { title: 'Avg Hours/Shift', value: avgHoursPerShift.toFixed(2), icon: BarChart, change: 'h' },
  ];
  
  return (
    <div>
        <div className="flex justify-end mb-4">
            <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="month">This Month</TabsTrigger>
                    <TabsTrigger value="all">All Time</TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map(item => (
            <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-headline">{item.value}</div>
                <p className="text-xs text-muted-foreground">Total for selected period</p>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
}
