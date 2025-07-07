import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const editProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  pitchDeck: z.any().optional(), // PDF file
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

interface Product {
    _id: string;
    name: string;
    description?: string;
    pitchDeck?: string;
}

interface EditProductFormProps {
  product: Product | null;
  onSuccess: () => void;
}

export default function EditProductForm({ product, onSuccess }: EditProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!product) return;
      return apiRequest('PATCH', `/api/products/${product._id}`, formData, { 'Content-Type': 'multipart/form-data' });
    },
    onSuccess: () => {
      toast({ title: 'Product Updated', description: 'Your product details have been successfully updated.' });
      queryClient.invalidateQueries({ queryKey: ['founder-products'] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: EditProductFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    if (data.pitchDeck && data.pitchDeck[0]) {
      formData.append('pitchDeck', data.pitchDeck[0]);
    }
    mutation.mutate(formData);
  };

  if (!product) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pitchDeck"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload New Pitch Deck (PDF)</FormLabel>
              <FormControl><Input type="file" accept="application/pdf" {...form.register('pitchDeck')} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
} 