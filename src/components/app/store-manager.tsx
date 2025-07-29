"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Store } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Store as StoreIcon, Trash2, PlusCircle, Home } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required."),
  number: z.string().length(4, "Store number must be 4 digits.").regex(/^\d{4}$/, "Must be 4 digits."),
  mileage: z.coerce.number().min(0, "Mileage must be a positive number.").optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  homeStoreId?: string;
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onDeleteStore: (id: string) => void;
  onSetHomeStore: (id: string) => void;
}

export function StoreManager({ open, onOpenChange, stores, homeStoreId, onAddStore, onDeleteStore, onSetHomeStore }: StoreManagerProps) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      number: '',
      mileage: 0,
    }
  });

  function onSubmit(data: StoreFormValues) {
    onAddStore(data);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><StoreIcon /> Manage Stores</DialogTitle>
          <DialogDescription>
            Add, edit, or remove your work locations here. Designate a home store for fuel calculations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem className="col-span-3 sm:col-span-1">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., City Center" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                        <FormItem className="col-span-3 sm:col-span-1">
                            <FormLabel>Number</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 1234" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="mileage"
                        render={({ field }) => (
                        <FormItem className="col-span-3 sm:col-span-1">
                            <FormLabel>Mileage</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="from home" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add New Store
                </Button>
            </form>
          </Form>

          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your Stores</h4>
            <p className="text-xs text-muted-foreground">Select your primary 'home' store.</p>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-4">
                <RadioGroup value={homeStoreId} onValueChange={onSetHomeStore}>
                    {stores.length > 0 ? (
                    stores.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <div className="flex items-center gap-4">
                                <RadioGroupItem value={store.id} id={store.id} />
                                <div className="flex-grow">
                                    <label htmlFor={store.id} className="font-medium cursor-pointer flex items-center gap-2">
                                        {store.name} #{store.number}
                                        {store.id === homeStoreId && <Home className="h-4 w-4 text-primary" />}
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                        {store.mileage ? `${store.mileage} miles from home` : 'No mileage set'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onDeleteStore(store.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))
                    ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No stores added yet.</p>
                    )}
                </RadioGroup>
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
