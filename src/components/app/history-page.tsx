"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Shift, Store, UserData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { startOfWeek, parseISO, format, addDays, subDays } from 'date-fns';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { useUserData } from '@/hooks/use-user-data';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const IN_CHARGE_BONUS = 0.25;
const FUEL_RATE_PER_MILE = 0.30;

const calculateWorkHours = (shift: Shift) => {
    const start = new Date(`${shift.date}T${shift.startTime}`);
    const end = new Date(`${shift.date}T${shift.endTime}`);
    let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours < 0) durationHours += 24; // Overnight
    const breakHours = shift.breakDuration / 60;
    return durationHours - breakHours;
};


// Component for the new Pay Cycle View
function PayCycleView({ allShifts, stores, payRate, lastPayday }: { allShifts: Shift[], stores: Store[], payRate: number, lastPayday: string }) {
    
    const getStore = (storeId?: string) => stores.find(s => s.id === storeId);

    const payCycles = useMemo(() => {
        const cycles: { [key: string]: { startDate: Date, endDate: Date, weeks: { [key: string]: Shift[] } } } = {};
        if (!lastPayday) return [];

        const lastPaydayDate = parseISO(lastPayday);
        
        const sortedShifts = [...allShifts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedShifts.forEach(shift => {
            const shiftDate = parseISO(shift.date);
            
            let cycleEndDate = new Date(lastPaydayDate);
            while (shiftDate > cycleEndDate) {
                cycleEndDate = addDays(cycleEndDate, 28);
            }
            let cycleStartDate = subDays(cycleEndDate, 27);
            
            const cycleKey = format(cycleEndDate, 'yyyy-MM-dd');

            if (!cycles[cycleKey]) {
                cycles[cycleKey] = {
                    startDate: cycleStartDate,
                    endDate: cycleEndDate,
                    weeks: {}
                };
            }

            const weekStart = startOfWeek(shiftDate, { weekStartsOn: 1 });
            const weekStartString = format(weekStart, 'yyyy-MM-dd');
            if (!cycles[cycleKey].weeks[weekStartString]) {
                cycles[cycleKey].weeks[weekStartString] = [];
            }
            cycles[cycleKey].weeks[weekStartString].push(shift);
        });

        return Object.entries(cycles).sort(([keyA], [keyB]) => new Date(keyB).getTime() - new Date(keyA).getTime());
    }, [allShifts, lastPayday]);

    const calculateWeekStats = useCallback((weekShifts: Shift[]) => {
        return weekShifts.reduce((acc, shift) => {
            const hours = calculateWorkHours(shift);
            const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
            const grossPay = hours * hourlyRate;
            let fuelExpense = 0;
            if (shift.isFuelClaim && shift.storeId) {
                const store = getStore(shift.storeId);
                if (store?.mileage) {
                    fuelExpense = store.mileage * 2 * FUEL_RATE_PER_MILE;
                }
            }
            acc.totalHours += hours;
            acc.grossPay += grossPay;
            acc.totalFuel += fuelExpense;
            acc.totalPay += grossPay + fuelExpense;
            return acc;
        }, { totalHours: 0, grossPay: 0, totalFuel: 0, totalPay: 0 });
    }, [payRate, getStore]);

    return (
        <Accordion type="single" collapsible className="w-full">
            {payCycles.map(([cycleKey, cycleData]) => {
                const cycleStats = Object.values(cycleData.weeks).flat().reduce((acc, shift) => {
                     const hours = calculateWorkHours(shift);
                    const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                    const grossPay = hours * hourlyRate;
                    let fuelExpense = 0;
                    if (shift.isFuelClaim && shift.storeId) {
                        const store = getStore(shift.storeId);
                        if (store?.mileage) {
                            fuelExpense = store.mileage * 2 * FUEL_RATE_PER_MILE;
                        }
                    }
                    acc.totalHours += hours;
                    acc.grossPay += grossPay;
                    acc.totalFuel += fuelExpense;
                    acc.totalPay += grossPay + fuelExpense;
                    return acc;
                }, { totalHours: 0, grossPay: 0, totalFuel: 0, totalPay: 0 });

                return (
                    <AccordionItem value={cycleKey} key={cycleKey}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4">
                                <div>
                                    <p className="font-semibold">Pay Period: {format(cycleData.startDate, 'MMM d, yyyy')} - {format(cycleData.endDate, 'MMM d, yyyy')}</p>
                                    <p className="text-sm text-muted-foreground text-left">
                                        Hours: {cycleStats.totalHours.toFixed(2)} | Fuel: £{cycleStats.totalFuel.toFixed(2)}
                                    </p>
                                </div>
                                <span className="font-mono text-right text-lg">£{cycleStats.totalPay.toFixed(2)}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Week</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Gross Pay</TableHead>
                                        <TableHead className="text-right">Fuel</TableHead>
                                        <TableHead className="text-right">Total Pay</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(cycleData.weeks)
                                        .sort(([weekA], [weekB]) => new Date(weekA).getTime() - new Date(weekB).getTime())
                                        .map(([weekStart, weekShifts]) => {
                                        const weekStats = calculateWeekStats(weekShifts);
                                        const weekStartDate = parseISO(weekStart);
                                        const weekEndDate = addDays(weekStartDate, 6);
                                        return (
                                            <TableRow key={weekStart}>
                                                <TableCell>{format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d')}</TableCell>
                                                <TableCell className="text-right">{weekStats.totalHours.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">£{weekStats.grossPay.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">£{weekStats.totalFuel.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-medium">£{weekStats.totalPay.toFixed(2)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">{cycleStats.totalHours.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">£{cycleStats.grossPay.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">£{cycleStats.totalFuel.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold">£{cycleStats.totalPay.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                           </Table>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}


// Component for the original Weekly View (as a fallback)
function WeeklyView({ allShifts, stores, payRate }: { allShifts: Shift[], stores: Store[], payRate: number }) {
    const getStore = (storeId?: string) => stores.find(s => s.id === storeId);
    
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

    return (
        <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedShifts).map(([weekStart, shiftsInWeek]) => {
                const weekStartDate = parseISO(weekStart);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);

                const { totalHours, grossPay, totalFuel, totalPay } = shiftsInWeek.reduce((acc, shift) => {
                    const hours = calculateWorkHours(shift);
                    const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                    acc.totalHours += hours;
                    acc.grossPay += hours * hourlyRate;

                    if (shift.isFuelClaim && shift.storeId) {
                      const store = getStore(shift.storeId);
                      if (store?.mileage) {
                        acc.totalFuel += store.mileage * 2 * FUEL_RATE_PER_MILE;
                      }
                    }
                    acc.totalPay = acc.grossPay + acc.totalFuel;
                    return acc;
                }, { totalHours: 0, grossPay: 0, totalFuel: 0, totalPay: 0 });

                return (
                    <AccordionItem value={weekStart} key={weekStart}>
                        <AccordionTrigger>
                            <div className="flex justify-between w-full pr-4">
                                <span>Week of {format(weekStartDate, 'PPP')} - {format(weekEndDate, 'PPP')}</span>
                                <span className="font-mono text-right">£{totalPay.toFixed(2)}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Pay</TableHead>
                                        <TableHead>Fuel</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shiftsInWeek.map(shift => {
                                        const hours = calculateWorkHours(shift);
                                        const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                                        const pay = hours * hourlyRate;
                                        const store = getStore(shift.storeId);
                                        let fuelExpense = 0;
                                        if (shift.isFuelClaim && store?.mileage) {
                                          fuelExpense = store.mileage * 2 * FUEL_RATE_PER_MILE;
                                        }
                                        const total = pay + fuelExpense;
                                        return (
                                            <TableRow key={shift.id}>
                                                <TableCell>{format(parseISO(shift.date), 'EEE, MMM d')}</TableCell>
                                                <TableCell>{store ? `${store.name} (${store.number})` : 'N/A'}</TableCell>
                                                <TableCell>{hours.toFixed(2)}</TableCell>
                                                <TableCell>£{pay.toFixed(2)}</TableCell>
                                                <TableCell>{fuelExpense > 0 ? `£${fuelExpense.toFixed(2)}` : '-'}</TableCell>
                                                <TableCell className="text-right">£{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={2}>Total</TableCell>
                                        <TableCell>{totalHours.toFixed(2)}</TableCell>
                                        <TableCell>£{grossPay.toFixed(2)}</TableCell>
                                        <TableCell>£{totalFuel.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">£{totalPay.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}

export function HistoryPage() {
    const { user } = useAuth();
    const { userData, loading: userDataLoading } = useUserData();
    const [allShifts, setAllShifts] = useState<Shift[]>([]);
    const [isLoadingShifts, setIsLoadingShifts] = useState(true);

    useEffect(() => {
      const fetchAllShifts = async () => {
        if (!user) {
            setIsLoadingShifts(false);
            return;
        }
        try {
            const shiftsRef = collection(db, `users/${user.uid}/shifts`);
            const querySnapshot = await getDocs(shiftsRef);
            const allShiftsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
            setAllShifts(allShiftsData);
        } catch (error) {
            console.error("Error fetching all shifts: ", error);
        } finally {
            setIsLoadingShifts(false);
        }
      };

      fetchAllShifts();
    }, [user]);

    const { stores = [], payRate = 12.21, lastPayday } = userData || {};
    
    if (userDataLoading || isLoadingShifts) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const hasShifts = allShifts && allShifts.length > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="font-headline">Shift History</CardTitle>
                        <CardDescription>A complete log of all your past shifts, grouped by pay period.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!hasShifts ? (
                    <p className="text-center text-muted-foreground py-12">No shifts have been logged yet.</p>
                ) : lastPayday ? (
                    <PayCycleView allShifts={allShifts} stores={stores} payRate={payRate} lastPayday={lastPayday} />
                ) : (
                    <>
                    <Alert className="mb-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Set Your Payday</AlertTitle>
                        <AlertDescription>
                          To see your shifts grouped by pay cycle, set your last payday on the dashboard.
                        </AlertDescription>
                    </Alert>
                    <WeeklyView allShifts={allShifts} stores={stores} payRate={payRate} />
                    </>
                )}
            </CardContent>
        </Card>
    );
}

    