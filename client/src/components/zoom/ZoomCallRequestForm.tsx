import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { socket } from '@/socket';

// Zoom call request form props
interface ZoomCallRequestFormProps {
  targetType: 'founder' | 'investor' | 'mentor' | 'admin';
  targetId?: string;
  targetName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Time slots
const TIME_SLOTS = [
  { id: "9am", label: "9:00 AM" },
  { id: "10am", label: "10:00 AM" },
  { id: "11am", label: "11:00 AM" },
  { id: "12pm", label: "12:00 PM" },
  { id: "1pm", label: "1:00 PM" },
  { id: "2pm", label: "2:00 PM" },
  { id: "3pm", label: "3:00 PM" },
  { id: "4pm", label: "4:00 PM" },
  { id: "5pm", label: "5:00 PM" }
];

export default function ZoomCallRequestForm({ 
  targetType, 
  targetId, 
  targetName,
  onSuccess, 
  onCancel 
}: ZoomCallRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    timeSlot: "",
    agreeToNDA: false
  });
  
  // Call request mutation
  const requestCallMutation = useMutation({
    mutationFn: async (data: typeof formData & { date?: Date }) => {
      const payload = {
        ...data,
        targetType,
        targetId,
        date: data.date ? format(data.date, 'yyyy-MM-dd') : undefined
      };
      
      return await apiRequest("POST", "/api/user/request-zoom-call", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/zoom-calls'] });
      
      toast({
        title: "Zoom call requested",
        description: "Your request has been sent to the admin for approval",
      });
      
      // Reset form
      setFormData({
        subject: "",
        message: "",
        timeSlot: "",
        agreeToNDA: false
      });
      setDate(addDays(new Date(), 1));
      
      // Call success callback
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Request failed",
        description: error.message || "Could not submit your request. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    function handleZoomCallRequested(data: any) {
      toast({ title: 'Zoom Call Requested', description: 'Your request has been sent to the admin for approval.' });
      if (onSuccess) onSuccess();
    }
    function handleZoomCallResponse(data: any) {
      toast({ title: 'Zoom Call Update', description: data.message || 'Zoom call status updated.' });
    }
    socket.on('zoomCallRequested', handleZoomCallRequested);
    socket.on('zoomCallResponse', handleZoomCallResponse);
    return () => {
      socket.off('zoomCallRequested', handleZoomCallRequested);
      socket.off('zoomCallResponse', handleZoomCallResponse);
    };
  }, [toast, onSuccess]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message || !formData.timeSlot || !date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (!formData.agreeToNDA) {
      toast({
        title: "NDA agreement required",
        description: "You must agree to the NDA to proceed with the call request",
        variant: "destructive",
      });
      return;
    }
    // Emit socket.io event for real-time Zoom call request
    socket.emit('requestZoomCall', {
      ...formData,
      targetType,
      targetId,
      date: date ? format(date, 'yyyy-MM-dd') : undefined
    });
    // Optionally reset form
    setFormData({ subject: "", message: "", timeSlot: "", agreeToNDA: false });
    setDate(addDays(new Date(), 1));
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Get target type display text
  const getTargetTypeText = () => {
    switch (targetType) {
      case 'founder':
        return targetName ? `Founder: ${targetName}` : 'a Founder';
      case 'investor':
        return targetName ? `Investor: ${targetName}` : 'an Investor';
      case 'mentor':
        return targetName ? `Mentor: ${targetName}` : 'a Mentor';
      case 'admin':
        return 'Admin';
      default:
        return 'someone';
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request Zoom Call</CardTitle>
        <CardDescription>
          Schedule a Zoom call with {getTargetTypeText()}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Call Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Call Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of the call purpose"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Provide details about what you'd like to discuss"
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          
          {/* Scheduling */}
          <div className="space-y-2 pt-2">
            <h3 className="text-lg font-medium">Preferred Date & Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Time Slot *</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) => handleSelectChange("timeSlot", value)}
                >
                  <SelectTrigger id="timeSlot">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* NDA Agreement */}
          <div className="pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="agreeToNDA"
                checked={formData.agreeToNDA}
                onCheckedChange={(checked) => handleSwitchChange("agreeToNDA", checked)}
              />
              <Label htmlFor="agreeToNDA" className="font-medium">
                I agree to the Non-Disclosure Agreement
              </Label>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              All discussions in this call will be confidential and subject to our standard NDA.
            </p>
          </div>
          
          {/* Admin approval notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium">Admin approval required</p>
              <p>Your Zoom call request will need to be approved by an admin before it's scheduled. 
              You'll receive the Zoom link once it's approved.</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          
          <Button type="submit" disabled={requestCallMutation.isPending}>
            {requestCallMutation.isPending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Request Call"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}