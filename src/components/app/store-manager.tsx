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
import { Store as StoreIcon, Trash2, PlusCircle } from 'lucide-react';

const storeSchema = z.object({
  name: z.string().min(1, "Store name is required."),
  number: z.string().length(4, "Store number must be 4 digits.").regex(/^\d{4}$/, "Must be 4 digits."),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: Store[];
  onAddStore: (store: Omit<Store, 'id'>) => void;
  onDeleteStore: (id: string) => void;
}

export function StoreManager({ open, onOpenChange, stores, onAddStore, onDeleteStore }: StoreManagerProps) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      number: '',
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
            Add, edit, or remove your work locations here.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 items-start gap-4">
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
              <div className="col-span-3 sm:col-span-1 self-end">
                <Button type="submit" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </form>
          </Form>

          <Separator />
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your Stores</h4>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-4 space-y-2">
                {stores.length > 0 ? (
                  stores.map(store => (
                    <div key={store.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-muted-foreground">#{store.number}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteStore(store.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">No stores added yet.</p>
                )}
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
