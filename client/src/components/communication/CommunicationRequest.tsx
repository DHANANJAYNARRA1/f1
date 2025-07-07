import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from '@/hooks/use-auth';

// Schema for the communication request form
const communicationRequestSchema = z.object({
  targetUserId: z.string(),
  targetName: z.string(),
  requestType: z.enum(["meeting", "call", "message"]),
  subject: z.string().min(3, {
    message: "Subject must be at least 3 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  date: z.date().optional(),
  time: z.string().optional(),
  ndaAgreed: z.boolean().refine(val => val === true, {
    message: "You must agree to the NDA terms.",
  }),
});

type CommunicationRequestFormValues = z.infer<typeof communicationRequestSchema>;

interface CommunicationRequestProps {
  targetUserId: string;
  targetName: string;
  targetType: "investor" | "founder";
  buttonLabel?: string;
  buttonVariant?: 
    "default" | 
    "destructive" | 
    "outline" | 
    "secondary" | 
    "ghost" | 
    "link";
  onSuccess?: () => void;
}

export default function CommunicationRequest({
  targetUserId,
  targetName,
  targetType,
  buttonLabel = "Request Communication",
  buttonVariant = "default",
  onSuccess
}: CommunicationRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  // Assume we have a way to check if NDA/deal/payment is signed
  const isDealComplete = false; // TODO: Replace with real logic
  const isAdminMediationRequired = (user?.userType === 'founder' && targetType === 'investor') || (user?.userType === 'investor' && targetType === 'founder');
  
  // Default form values
  const defaultValues: Partial<CommunicationRequestFormValues> = {
    targetUserId,
    targetName,
    requestType: "meeting",
    subject: "",
    message: "",
    ndaAgreed: false,
  };
  
  const form = useForm<CommunicationRequestFormValues>({
    resolver: zodResolver(communicationRequestSchema),
    defaultValues,
  });
  
  // Watch request type to conditionally show date/time fields
  const requestType = form.watch("requestType");
  const needsScheduling = requestType === "meeting" || requestType === "call";
  
  async function onSubmit(data: CommunicationRequestFormValues) {
    setIsSubmitting(true);
    
    try {
      // Submit communication request to the API
      const response = await apiRequest<{ success: boolean; message?: string }>("POST", "/api/communication-requests", {
        ...data,
        targetType,
      });
      
      if (!response.success) {
        throw new Error(response.message || "Failed to send request");
      }
      
      toast({
        title: "Request sent successfully",
        description: "Your communication request has been sent and is awaiting approval.",
      });
      
      // Close the dialog and reset the form
      setIsOpen(false);
      form.reset(defaultValues);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting communication request:", error);
      toast({
        title: "Failed to send request",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRequest = () => {
    if (isAdminMediationRequired && !isDealComplete) {
      alert('Direct contact is not allowed. All communication must be routed through admin/superadmin until a deal, payment, or NDA is signed.');
      return;
    }
    // ...existing request logic...
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          onClick={handleRequest}
          disabled={isAdminMediationRequired && !isDealComplete}
          title={isAdminMediationRequired && !isDealComplete ? 'Admin/Superadmin mediation required' : ''}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Communication with {targetName}</DialogTitle>
          <DialogDescription>
            Fill out this form to request a communication with {targetType === "investor" ? "this investor" : "this founder"}.
            All requests are reviewed by our admin team.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Communication Type</FormLabel>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={field.value === "meeting" ? "default" : "outline"}
                      className={cn(
                        "flex-1 gap-2",
                        field.value === "meeting" && "bg-primary"
                      )}
                      onClick={() => field.onChange("meeting")}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      Meeting
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "call" ? "default" : "outline"}
                      className={cn(
                        "flex-1 gap-2",
                        field.value === "call" && "bg-primary"
                      )}
                      onClick={() => field.onChange("call")}
                    >
                      <Clock className="h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "message" ? "default" : "outline"}
                      className={cn(
                        "flex-1 gap-2",
                        field.value === "message" && "bg-primary"
                      )}
                      onClick={() => field.onChange("message")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief purpose of your request" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe why you want to connect and what you hope to discuss" 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {needsScheduling && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Preferred Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
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
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <FormControl>
                        <Input type="time" placeholder="Select a time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <FormField
              control={form.control}
              name="ndaAgreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Non-Disclosure Agreement
                    </FormLabel>
                    <FormDescription>
                      I agree to maintain confidentiality regarding all information shared during this communication.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending request..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}