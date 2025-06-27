"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Shift } from '@/types';
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
import { CalendarIcon, Clock, Coffee, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

const shiftFormSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  breakDuration: z.coerce.number().min(0, "Break must be positive.").default(0),
  inCharge: z.boolean().default(false),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  onAddShift: (shift: Omit<Shift, 'id'>) => void;
}

export function ShiftForm({ onAddShift }: ShiftFormProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: '',
      endTime: '',
      breakDuration: 0,
      inCharge: false,
    }
  });

  function onSubmit(data: ShiftFormValues) {
    onAddShift({
        date: data.date.toISOString().split('T')[0],
        startTime: data.startTime,
        endTime: data.endTime,
        breakDuration: data.breakDuration,
        inCharge: data.inCharge
    });
    form.reset({ ...form.getValues(), startTime: '', endTime: '', breakDuration: 0, inCharge: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Log a New Shift</CardTitle>
        <CardDesc>Enter the details for your work shift.</CardDesc>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
