'use server';
/**
 * @fileOverview An AI agent for estimating tax deductions.
 *
 * - estimateTaxDeductions - A function that estimates tax deductions based on user input.
 * - EstimateTaxDeductionsInput - The input type for the estimateTaxDeductions function.
 * - EstimateTaxDeductionsOutput - The return type for the estimateTaxDeductions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateTaxDeductionsInputSchema = z.object({
  income: z
    .number()
    .describe('Your annual income in USD.'),
  location: z
    .string()
    .describe('Your location (e.g., city, state) for tax purposes.'),
  commonDeductions: z
    .string()
    .describe(
      'A comma-separated list of common tax deductions you expect to claim (e.g., student loan interest, IRA contributions).' // Corrected typo here
    ),
});
export type EstimateTaxDeductionsInput = z.infer<
  typeof EstimateTaxDeductionsInputSchema
>;

const EstimateTaxDeductionsOutputSchema = z.object({
  estimatedTaxDeductions: z
    .string()
    .describe(
      'An estimate of your total tax deductions based on the provided information. This is not financial advice.'
    ),
  disclaimer: z
    .string()
    .describe(
      'A disclaimer stating that this is only an estimate and not financial advice.'
    ),
});
export type EstimateTaxDeductionsOutput = z.infer<
  typeof EstimateTaxDeductionsOutputSchema
>;

export async function estimateTaxDeductions(
  input: EstimateTaxDeductionsInput
): Promise<EstimateTaxDeductionsOutput> {
  return estimateTaxDeductionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'estimateTaxDeductionsPrompt',
  input: {schema: EstimateTaxDeductionsInputSchema},
  output: {schema: EstimateTaxDeductionsOutputSchema},
  prompt: `You are a tax estimation assistant. You will estimate the tax deductions for the user based on their income, location, and common deductions.

  Income: {{{income}}}
  Location: {{{location}}}
  Common Deductions: {{{commonDeductions}}}

  Provide an estimate of the total tax deductions, and include a disclaimer that this is only an estimate and not financial advice.
  The response should be easily readable and understandable.
`,
});

const estimateTaxDeductionsFlow = ai.defineFlow(
  {
    name: 'estimateTaxDeductionsFlow',
    inputSchema: EstimateTaxDeductionsInputSchema,
    outputSchema: EstimateTaxDeductionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
