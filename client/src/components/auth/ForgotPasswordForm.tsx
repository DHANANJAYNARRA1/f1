import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

// Validation schemas for each step
const emailSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be at least 6 characters" }),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Combined type for all form fields
type FormValues = z.infer<typeof emailSchema> & z.infer<typeof otpSchema> & z.infer<typeof passwordSchema>;

enum ResetStep {
  RequestOTP = 0,
  EnterOTP = 1,
  ResetPassword = 2,
  Complete = 3,
}

export default function ForgotPasswordForm({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.RequestOTP);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(
      currentStep === ResetStep.RequestOTP
        ? emailSchema
        : currentStep === ResetStep.EnterOTP
        ? otpSchema
        : passwordSchema
    ),
    defaultValues: {
      username: "",
      phone: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Request password reset mutation
  const requestResetMutation = useMutation({
    mutationFn: async (data: { username: string, phone?: string }) => {
      const response = await apiRequest<{ success: boolean; message?: string }>("POST", "/api/forgot-password", data);
      if (!response.success) {
        throw new Error(response.message || "Failed to send reset code");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Reset code sent",
        description: "If your email is registered, you will receive a reset code.",
      });
      setCurrentStep(ResetStep.EnterOTP);
      setEmail(form.getValues().username);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Validate OTP mutation
  const validateOtpMutation = useMutation({
    mutationFn: async (data: { username: string; otp: string }) => {
      const response = await apiRequest<{ success: boolean; message?: string }>("POST", "/api/validate-reset-otp", data);
      if (!response.success) {
        throw new Error(response.message || "Invalid or expired reset code");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Code validated",
        description: "Reset code is valid. You can now set a new password.",
      });
      setCurrentStep(ResetStep.ResetPassword);
      setOtp(form.getValues().otp);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { username: string; otp: string; newPassword: string }) => {
      const response = await apiRequest<{ success: boolean; message?: string }>("POST", "/api/reset-password", data);
      if (!response.success) {
        throw new Error(response.message || "Failed to reset password");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      setCurrentStep(ResetStep.Complete);
      if (onComplete) {
        setTimeout(onComplete, 2000); // Give user time to read the success message
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (data: FormValues) => {
    if (currentStep === ResetStep.RequestOTP) {
      requestResetMutation.mutate({
        username: data.username,
        phone: data.phone || undefined
      });
    } else if (currentStep === ResetStep.EnterOTP) {
      validateOtpMutation.mutate({ username: email, otp: data.otp });
    } else if (currentStep === ResetStep.ResetPassword) {
      resetPasswordMutation.mutate({
        username: email,
        otp: otp,
        newPassword: data.newPassword,
      });
    }
  };

  // Determine if any mutation is loading
  const isLoading = 
    requestResetMutation.isPending || 
    validateOtpMutation.isPending || 
    resetPasswordMutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {currentStep === ResetStep.RequestOTP && "Enter your email and phone (optional) to receive a reset code"}
          {currentStep === ResetStep.EnterOTP && "Enter the code sent to your phone or email"}
          {currentStep === ResetStep.ResetPassword && "Create a new password"}
          {currentStep === ResetStep.Complete && "Password reset complete"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep !== ResetStep.Complete ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {currentStep === ResetStep.RequestOTP && (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email address" 
                            type="email" 
                            autoComplete="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional, for SMS)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number for SMS" 
                            type="tel"
                            autoComplete="tel"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === ResetStep.EnterOTP && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter the reset code sent to your phone or email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentStep === ResetStep.ResetPassword && (
                <>
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter your new password" 
                              type={showNewPassword ? "text" : "password"}
                              autoComplete="new-password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Confirm your new password" 
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentStep === ResetStep.RequestOTP && "Sending..."}
                    {currentStep === ResetStep.EnterOTP && "Verifying..."}
                    {currentStep === ResetStep.ResetPassword && "Resetting..."}
                  </>
                ) : (
                  <>
                    {currentStep === ResetStep.RequestOTP && "Send Reset Code"}
                    {currentStep === ResetStep.EnterOTP && "Verify Code"}
                    {currentStep === ResetStep.ResetPassword && "Reset Password"}
                  </>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center p-4">
            <p className="text-green-600 mb-2">Password reset successful!</p>
            <p>You can now log in with your new password.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep !== ResetStep.RequestOTP && currentStep !== ResetStep.Complete && (
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep(currentStep - 1);
              form.reset();
            }}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        
        {onComplete && (
          <Button
            variant="ghost"
            onClick={onComplete}
            className={currentStep === ResetStep.RequestOTP ? "ml-auto" : ""}
            disabled={isLoading}
          >
            {currentStep === ResetStep.Complete ? "Return to Login" : "Cancel"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}