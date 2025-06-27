"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Loader2, Info } from 'lucide-react';
import { estimateTaxDeductions } from '@/ai/flows/estimate-tax-deductions';
import type { EstimateTaxDeductionsOutput } from '@/ai/flows/estimate-tax-deductions';

const taxEstimatorSchema = z.object({
  income: z.coerce.number().positive("Estimated annual income must be positive."),
  location: z.string().min(2, "Location is required."),
  commonDeductions: z.string().optional(),
});

type TaxEstimatorValues = z.infer<typeof taxEstimatorSchema>;

interface TaxEstimatorDialogProps {
  grossPay: number;
  payRate: number;
  totalHours: number;
}

export function TaxEstimatorDialog({ grossPay, payRate, totalHours }: TaxEstimatorDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<EstimateTaxDeductionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedAnnualIncome = totalHours > 0 ? (grossPay / totalHours) * 40 * 52 : payRate * 40 * 52;

  const form = useForm<TaxEstimatorValues>({
    resolver: zodResolver(taxEstimatorSchema),
    defaultValues: {
      income: estimatedAnnualIncome > 0 ? parseFloat(estimatedAnnualIncome.toFixed(2)) : undefined,
      location: 'UK',
      commonDeductions: 'standard tax-free Personal Allowance',
    },
  });

  const onOpenChange = (open: boolean) => {
    if (open) {
      form.reset({
        income: estimatedAnnualIncome > 0 ? parseFloat(estimatedAnnualIncome.toFixed(2)) : undefined,
        location: 'UK',
        commonDeductions: 'standard tax-free Personal Allowance',
      });
      setResult(null);
      setError(null);
    }
    setIsOpen(open);
  }
  
  async function onSubmit(data: TaxEstimatorValues) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const estimation = await estimateTaxDeductions(data);
      setResult(estimation);
    } catch (e) {
      setError("Failed to get tax estimation. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
            <Bot className="mr-2 h-4 w-4" />
            Estimate Tax
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2"><Bot /> AI Tax Estimator</DialogTitle>
          <DialogDescription>
            Provide some details to get an AI-powered tax deduction estimate. This is not financial advice.
          </DialogDescription>
        </DialogHeader>
        
        {!result ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
                control={form.control}
                name="income"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Annual Income (£)</FormLabel>
                    <FormControl>
                      <Input type="number" step="100" placeholder="e.g., 30000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Country)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., UK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="commonDeductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Common Deductions</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., pension contributions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            <DialogFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Estimating...</> : 'Get Estimation'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
        ) : (
            <div className="py-4 space-y-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="font-headline">Estimated Deductions</AlertTitle>
                    <AlertDescription>
                        <p className="font-bold text-lg text-primary">{result.estimatedTaxDeductions}</p>
                    </AlertDescription>
                </Alert>
                 <Alert variant="destructive">
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>
                        {result.disclaimer}
                    </AlertDescription>
                </Alert>
                <DialogFooter>
                     <Button variant="outline" onClick={() => { setResult(null); }}>
                        Estimate Again
                    </Button>
                </DialogFooter>
            </div>
        )}
        {error && <p className="text-sm text-destructive text-center">{error}</p>}

      </DialogContent>
    </Dialog>
  );
}
