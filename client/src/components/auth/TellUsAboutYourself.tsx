import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TellUsAboutYourself() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const form = useForm({
    defaultValues: {
      bio: '',
      company: '',
      position: '',
      website: '',
    },
  });
  const onSubmit = async (data: any) => {
    // Submit additional profile details to backend (implement endpoint as needed)
    await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    toast({ title: 'Profile updated!' });
    navigate('/dashboard');
  };
  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader><CardTitle>Tell us about yourself</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Textarea placeholder="Tell us about yourself..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl><Input placeholder="Your company name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <FormControl><Input placeholder="Your position" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl><Input placeholder="https://yourcompany.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 