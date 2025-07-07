import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  shortDescription: z.string().min(1, "Short description is required").max(150, "Must be 150 characters or less"),
  longDescription: z.string().min(1, "Long description is required"),
  keyFeatures: z.string().min(1, "Key features are required"),
  businessModel: z.string().min(1, "Business model is required"),
  targetMarket: z.string().min(1, "Target market is required"),
  fundingAsk: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive("Must be a positive number")),
  equityOffered: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().min(0).max(100, "Must be between 0 and 100")),
  videoLink: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  images: z.any().refine((files) => files?.length > 0, "At least one image is required."),
  pitchDeck: z.any().refine((files) => files?.length === 1, "Pitch deck is required."),
});

const AddProductSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'images' && value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          if (value[i] instanceof File) {
            formData.append('images', value[i]);
          }
        }
      } else if (key === 'pitchDeck' && value instanceof FileList) {
        if (value.length > 0 && value[0] instanceof File) {
          formData.append('pitchDeck', value[0]);
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        formData.append(key, String(value));
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else if (value instanceof File) {
        formData.append(key, value);
      }
      // Do not append if value is {} or any other object or array
    });

    if(user?._id) {
        formData.append('founderId', user._id);
    }

    try {
      await apiRequest('/api/products', 'POST', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast({ title: "Success", description: "Your product has been submitted for review." });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit product.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Product or Project</CardTitle>
        <CardDescription>Fill out the details below to showcase your product to investors.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="name" render={({ field }) => (
                <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Innovate SaaS" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="category" render={({ field }) => (
                <FormItem><FormLabel>Category/Industry</FormLabel><FormControl><Input placeholder="e.g., FinTech, Healthcare" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField name="shortDescription" render={({ field }) => (
              <FormItem><FormLabel>Short Description (Max 150 chars)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="longDescription" render={({ field }) => (
              <FormItem><FormLabel>Long Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="keyFeatures" render={({ field }) => (
              <FormItem><FormLabel>Key Features (comma-separated)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="businessModel" render={({ field }) => (
              <FormItem><FormLabel>Business Model</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="targetMarket" render={({ field }) => (
              <FormItem><FormLabel>Target Market</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="fundingAsk" render={({ field }) => (
                <FormItem><FormLabel>Funding Ask ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="equityOffered" render={({ field }) => (
                <FormItem><FormLabel>Equity Offered (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
             <FormField name="videoLink" render={({ field }) => (
                <FormItem><FormLabel>Video Link (YouTube, Vimeo)</FormLabel><FormControl><Input placeholder="https://example.com/video" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            <FormField name="images" render={({ field: { onChange, ...field } }) => (
              <FormItem><FormLabel>Product Images</FormLabel><FormControl><Input type="file" multiple accept="image/*" onChange={(e) => onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField name="pitchDeck" render={({ field: { onChange, ...field } }) => (
              <FormItem><FormLabel>Pitch Deck (PDF Only)</FormLabel><FormControl><Input type="file" accept="application/pdf" onChange={(e) => onChange(e.target.files)} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
              <Button type="submit">Save Draft</Button>
              <Button type="submit">Submit for Review</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddProductSection; 