"use client";

import type { Shift } from '@/types';
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
import { Trash2, FileDown, Bot, Star, AlertCircle } from 'lucide-react';
import { TaxEstimatorDialog } from '@/components/app/tax-estimator-dialog';
import { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface ShiftsTableProps {
  shifts: Shift[];
  allShifts: Shift[];
  payRate: number;
  onDeleteShift: (id: string) => void;
  grossPay: number;
  isLocked?: boolean;
}

const IN_CHARGE_BONUS = 0.25;

export function ShiftsTable({ shifts, allShifts, payRate, onDeleteShift, grossPay, isLocked }: ShiftsTableProps) {
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

  const exportToCSV = () => {
    const headers = ['Date', 'Start Time', 'End Time', 'Break (min)', 'In Charge', 'Hours Worked', 'Gross Pay (£)'];
    const csvRows = allShifts
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(shift => {
        const hours = calculateWorkHours(shift);
        const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
        const pay = hours * hourlyRate;
        return [shift.date, shift.startTime, shift.endTime, shift.breakDuration, shift.inCharge ? 'Yes' : 'No', hours.toFixed(2), pay.toFixed(2)].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...csvRows].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "all_shifts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Button variant="outline" size="sm" onClick={exportToCSV} disabled={allShifts.length === 0}>
                <FileDown className="mr-2 h-4 w-4" />
                Export All
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLocked && (
            <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 !text-amber-800" />
                <AlertTitle className="font-semibold">Week Locked</AlertTitle>
                <AlertDescription className="text-amber-700">
                You cannot delete shifts from past weeks.
                </AlertDescription>
            </Alert>
        )}
        <div className="border rounded-md">
          <Table>
            {shifts.length === 0 && <TableCaption>No shifts logged for this week.</TableCaption>}
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Start</TableHead>
                <TableHead className="hidden sm:table-cell">End</TableHead>
                <TableHead className="hidden md:table-cell">Break</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Pay</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map(shift => {
                const workHours = calculateWorkHours(shift);
                const hourlyRate = payRate + (shift.inCharge ? IN_CHARGE_BONUS : 0);
                const shiftPay = workHours * hourlyRate;
                return (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        {new Date(shift.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        {shift.inCharge && <Star className="h-4 w-4 text-amber-400 fill-amber-400" title="In Charge Shift (+£0.25/hr)" />}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{shift.startTime}</TableCell>
                    <TableCell className="hidden sm:table-cell">{shift.endTime}</TableCell>
                    <TableCell className="hidden md:table-cell">{shift.breakDuration} min</TableCell>
                    <TableCell>{workHours.toFixed(2)}</TableCell>
                    <TableCell>£{shiftPay.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onDeleteShift(shift.id)} disabled={isLocked}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            {shifts.length > 0 && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="hidden md:table-cell">Total</TableCell>
                        <TableCell className="md:hidden" colSpan={1}>Total</TableCell>
                        <TableCell className="hidden sm:table-cell"></TableCell>
                        <TableCell>{totalHours.toFixed(2)}</TableCell>
                        <TableCell>£{grossPay.toFixed(2)}</TableCell>
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
