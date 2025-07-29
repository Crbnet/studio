"use client";

import { useState, useMemo } from 'react';
import type { Shift, Store, UserData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { startOfWeek, parseISO, format } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUserData } from '@/hooks/use-user-data';

const IN_CHARGE_BONUS = 0.25;

export function HistoryPage() {
    const { userData, loading } = useUserData();

    const { shifts: allShifts = [], stores = [], payRate = 12.21 } = userData || {};

    const groupedShifts = useMemo(() => {
        const groups: { [weekStart: string]: Shift[] } = {};
        allShifts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(shift => {
                const weekStart = startOfWeek(parseISO(shift.date), { weekStartsOn: 1 });
                const weekStartString = format(weekStart, 'yyyy-MM-dd');
                if (!groups[weekStartString]) {
                    groups[weekStartString] = [];
                }
                groups[weekStartString].push(shift);
            });
        return groups;
    }, [allShifts]);

    const calculateWorkHours = (shift: Shift) => {
        const start = new Date(`${shift.date}T${shift.startTime}`);
        const end = new Date(`${shift.date}T${shift.endTime}`);
        let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours < 0) durationHours += 24; // Overnight
        const breakHours = shift.breakDuration / 60;
        return durationHours - breakHours;
    };
    
    const getStore = (storeId?: string) => stores.find(s => s.id === storeId);
    
    if (loading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Shift History</CardTitle>
                        <CardDescription>A complete log of all your past shifts.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {Object.keys(groupedShifts).length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {Object.entries(groupedShifts).map(([weekStart, shiftsInWeek]) => {
                            const weekStartDate = parseISO(weekStart);
                            const weekEndDate = new Date(weekStartDate);
                            weekEndDate.setDate(weekEndDate.getDate() + 6);

                            const { totalHours, grossPay } = shiftsInWeek.reduce((acc, shift) => {
                                const hours = calculateWorkHours(shift);
                                const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                                acc.totalHours += hours;
                                acc.grossPay += hours * hourlyRate;
                                return acc;
                            }, { totalHours: 0, grossPay: 0 });

                            return (
                                <AccordionItem value={weekStart} key={weekStart}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <span>Week of {format(weekStartDate, 'PPP')} - {format(weekEndDate, 'PPP')}</span>
                                            <span className="font-mono text-right">£{grossPay.toFixed(2)}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Store</TableHead>
                                                    <TableHead>Time</TableHead>
                                                    <TableHead>Hours</TableHead>
                                                    <TableHead className="text-right">Pay</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {shiftsInWeek.map(shift => {
                                                    const hours = calculateWorkHours(shift);
                                                    const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                                                    const pay = hours * hourlyRate;
                                                    const store = getStore(shift.storeId);
                                                    return (
                                                        <TableRow key={shift.id}>
                                                            <TableCell>{format(parseISO(shift.date), 'EEE, MMM d')}</TableCell>
                                                            <TableCell>{store ? `${store.name} (${store.number})` : 'N/A'}</TableCell>
                                                            <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                                                            <TableCell>{hours.toFixed(2)}</TableCell>
                                                            <TableCell className="text-right">£{pay.toFixed(2)}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={3}>Total</TableCell>
                                                    <TableCell>{totalHours.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">£{grossPay.toFixed(2)}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                ) : (
                    <p className="text-center text-muted-foreground py-12">No shifts have been logged yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
