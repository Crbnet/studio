"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Shift, Store } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Coffee, PlusCircle, AlertCircle, Store as StoreIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, endOfWeek, isThisWeek, getDay, isSameWeek, subWeeks, addDays, subDays } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { StoreManager } from './store-manager';

const shiftFormSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  breakDuration: z.coerce.number().min(0, "Break must be positive.").default(0),
  inCharge: z.boolean().default(false),
  storeId: z.string().optional(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
  isLocked?: boolean;
  viewDate: Date;
  stores: Store[];
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onDeleteStore: (id: string) => void;
}

export function ShiftForm({ onAddShift, isLocked, viewDate, stores, onAddStore, onDeleteStore }: ShiftFormProps) {
  const [isStoreManagerOpen, setIsStoreManagerOpen] = useState(false);
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      date: viewDate,
      startTime: '',
      endTime: '',
      breakDuration: 0,
      inCharge: false,
      storeId: '',
    }
  });

  useEffect(() => {
    form.reset({
      date: viewDate,
      startTime: '',
      endTime: '',
      breakDuration: 0,
      inCharge: false,
      storeId: '',
    });
  }, [viewDate, form]);

  function onSubmit(data: ShiftFormValues) {
    onAddShift({
        date: data.date.toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration,
        inCharge: data.inCharge,
        storeId: data.storeId || undefined
    });
    form.reset({ ...form.getValues(), startTime: '', endTime: '', breakDuration: 0, inCharge: false, storeId: '' });
  }

  const weekStartsOn = 1; // Monday

  const getCalendarDisabledDays = (date: Date) => {
    const today = new Date();
    const isCurrentWeek = isThisWeek(date, { weekStartsOn });
    const isMonday = getDay(today) === 1;
    const isPreviousWeek = isSameWeek(date, subWeeks(today, 1), { weekStartsOn });
    const isFutureDate = date > addDays(today, 1);

    if (isFutureDate) return true;

    if (isMonday && (isPreviousWeek || isCurrentWeek)) {
      return false; // Unlock prev week on Monday
    }

    if(isCurrentWeek) return false;

    return true; // Lock all other past dates
  };

  return (
    <Card>
      <StoreManager
        open={isStoreManagerOpen}
        onOpenChange={setIsStoreManagerOpen}
        stores={stores}
        onAddStore={onAddStore}
        onDeleteStore={onDeleteStore}
      />
      <CardHeader>
        <CardTitle className="font-headline">Log a New Shift</CardTitle>
        <CardDesc>Enter the details for your work shift.</CardDesc>
      </CardHeader>
      <CardContent>
        {isLocked && (
          <Alert variant="default" className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 !text-amber-800" />
            <AlertTitle className="font-semibold">Editing Locked</AlertTitle>
            <AlertDescription className="text-amber-700">
              You can only add shifts for the current week (and the previous week on Mondays).
            </AlertDescription>
          </Alert>
        )}
        <fieldset disabled={isLocked} className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        weekStartsOn={1}
                        disabled={getCalendarDisabledDays}
                        defaultMonth={viewDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} className="pl-8" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                     <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} className="pl-8" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow">
                        <StoreIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="w-full pl-8">
                                <SelectValue placeholder="Select a store" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             <SelectItem value="" disabled>Select a store</SelectItem>
                            {stores.map(store => (
                              <SelectItem key={store.id} value={store.id}>
                                {store.name} ({store.number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsStoreManagerOpen(true)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
              control={form.control}
              name="breakDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break (minutes)</FormLabel>
                   <div className="relative">
                      <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input type="number" {...field} className="pl-8" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inCharge"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>
                      In Charge Shift
                    </FormLabel>
                    <FormDescription>
                      Adds a £0.25/hr bonus.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
            </div>
          </form>
        </Form>
        </fieldset>
      </CardContent>
    </Card>
  );
}

    