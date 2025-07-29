"use client";

import type { Shift, Store } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
  TableFooter,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, FileDown, Bot, Star, AlertCircle, Store as StoreIcon, Loader2 } from 'lucide-react';
import { TaxEstimatorDialog } from '@/components/app/tax-estimator-dialog';
import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ShiftsTableProps {
  shifts: Shift[];
  isLoading: boolean;
  stores: Store[];
  payRate: number;
  onDeleteShift: (id: string) => void;
  grossPay: number;
  isLocked?: boolean;
}

const IN_CHARGE_BONUS = 0.25;
const FUEL_RATE_PER_MILE = 0.30;

export function ShiftsTable({ shifts, isLoading, stores, payRate, onDeleteShift, grossPay, isLocked }: ShiftsTableProps) {
  
  const getStore = (storeId?: string) => stores.find(s => s.id === storeId);
  
  const calculateWorkHours = (shift: Shift) => {
    const start = new Date(`${shift.date}T${shift.startTime}`);
    const end = new Date(`${shift.date}T${shift.endTime}`);
    let durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if(durationHours < 0) durationHours += 24; // Overnight
    const breakHours = shift.breakDuration / 60;
    return durationHours - breakHours;
  };
  
  const totalHours = useMemo(() => {
    return shifts.reduce((total, shift) => total + calculateWorkHours(shift), 0);
  }, [shifts]);

  const totalFuelExpense = useMemo(() => {
    return shifts.reduce((total, shift) => {
      if (shift.isFuelClaim && shift.storeId) {
        const store = getStore(shift.storeId);
        if (store && store.mileage) {
          return total + (store.mileage * 2 * FUEL_RATE_PER_MILE);
        }
      }
      return total;
    }, 0);
  }, [shifts, stores]);

  const totalPay = grossPay + totalFuelExpense;


  const exportToCSV = () => {
    alert("CSV export will be available soon for all shifts!");
    // This functionality would need to be updated to fetch all shifts before exporting
    // For now, we are only disabling it visually but keeping the logic shell.
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Logged Shifts</CardTitle>
          <CardDescription>Your work shifts for the selected week.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <TaxEstimatorDialog grossPay={grossPay} payRate={payRate} totalHours={totalHours} />
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled>
                <FileDown className="mr-2 h-4 w-4" />
                Export All
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md min-h-[200px]">
          <Table>
            {shifts.length === 0 && !isLoading && <TableCaption>No shifts logged for this week.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Store</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Pay</TableHead>
                <TableHead className="hidden md:table-cell">Fuel</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-48">
                      <Loader2 className="h-6 w-6 animate-spin inline-block" />
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map(shift => {
                  const workHours = calculateWorkHours(shift);
                  const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                  const shiftPay = workHours * hourlyRate;
                  const store = getStore(shift.storeId);
                  let fuelExpense = 0;
                  if (shift.isFuelClaim && store?.mileage) {
                      fuelExpense = store.mileage * 2 * FUEL_RATE_PER_MILE;
                  }
                  const totalPay = shiftPay + fuelExpense;

                  return (
                    <TableRow key={shift.id}>
                      <TableCell>
                        <div className="font-medium">{new Date(shift.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{shift.startTime} - {shift.endTime}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          {store ? <> <StoreIcon className="h-4 w-4 text-muted-foreground" /> <div><div className="font-medium">{store.name}</div><div className="text-xs text-muted-foreground">#{store.number}</div></div> </> : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-1">
                            {workHours.toFixed(2)}
                            {shift.inCharge && <Star className="h-4 w-4 text-amber-400 fill-amber-400" title="In Charge Shift (+£0.25/hr)" />}
                          </div>
                      </TableCell>
                      <TableCell>£{shiftPay.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {shift.isFuelClaim ? `£${fuelExpense.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>£{totalPay.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onDeleteShift(shift.id)} disabled={isLocked}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
            {shifts.length > 0 && !isLoading && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={2} className="hidden md:table-cell">Total</TableCell>
                        <TableCell className="md:hidden" colSpan={1}>Total</TableCell>
                        <TableCell className="hidden sm:table-cell"></TableCell>
                        <TableCell>{totalHours.toFixed(2)}</TableCell>
                        <TableCell>£{grossPay.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell">£{totalFuelExpense.toFixed(2)}</TableCell>
                        <TableCell>£{totalPay.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
