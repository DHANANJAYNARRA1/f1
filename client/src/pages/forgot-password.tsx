import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaLeaf, FaEnvelope, FaMobile, FaLock, FaArrowLeft } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number").max(15, "Phone number too long"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ForgotPasswordStep = "input" | "verify" | "reset" | "success";
type ContactMethod = "email" | "phone";

export default function ForgotPasswordPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<ForgotPasswordStep>("input");
  const [method, setMethod] = useState<ContactMethod>("email");
  const [contactValue, setContactValue] = useState("");
  const [username, setUsername] = useState("");

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "", otp: "" },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (data: { username: string; method: ContactMethod }) => {
      return apiRequest("/api/forgot-password", "POST", data);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setStep("verify");
        
        // Always show OTP code if provided for testing
        if (data.testOTP) {
          toast({
            title: "🔑 Your Verification Code",
            description: `Code: ${data.testOTP} - Use this code to reset your password`,
            duration: 15000, // Show for 15 seconds
          });
          console.log("🔑 PASSWORD RESET CODE:", data.testOTP);
          
          // Also alert the user
          setTimeout(() => {
            alert(`Your verification code is: ${data.testOTP}\n\nPlease enter this code on the next screen to reset your password.`);
          }, 500);
        } else {
          toast({
            title: "Verification code sent",
            description: `A 6-digit code has been sent to your ${method}`,
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification code",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: { username: string; otp: string }) => {
      return apiRequest("/api/validate-reset-otp", "POST", data);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setStep("reset");
        toast({
          title: "Code verified",
          description: "Please set your new password",
        });
      } else {
        toast({
          title: "Invalid code",
          description: data.message || "Please check your code and try again",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { username: string; newPassword: string; otp: string }) => {
      return apiRequest("/api/reset-password", "POST", data);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setStep("success");
        toast({
          title: "Password reset successful",
          description: "Your password has been updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onEmailSubmit = (data: z.infer<typeof emailSchema>) => {
    setContactValue(data.email);
    setUsername(data.email);
    setMethod("email");
    sendOTPMutation.mutate({ username: data.email, method: "email" });
  };

  const onPhoneSubmit = (data: z.infer<typeof phoneSchema>) => {
    setContactValue(data.phone);
    setUsername(data.phone);
    setMethod("phone");
    sendOTPMutation.mutate({ username: data.phone, method: "phone" });
  };

  const onOTPSubmit = (data: z.infer<typeof otpSchema>) => {
    verifyOTPMutation.mutate({ username, otp: data.otp });
  };

  const onResetSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    resetPasswordMutation.mutate({ username, newPassword: data.newPassword, otp: data.otp });
  };

  const resendCode = () => {
    sendOTPMutation.mutate({ username, method });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <FaLeaf className="text-green-500 text-3xl" />
            <span className="text-2xl font-bold text-gray-800">IntelliMatch</span>
          </div>
          
          {step === "input" && (
            <>
              <CardTitle className="text-xl text-gray-800">Reset Password</CardTitle>
              <CardDescription>
                Choose how you'd like to receive your verification code
              </CardDescription>
            </>
          )}
          
          {step === "verify" && (
            <>
              <CardTitle className="text-xl text-gray-800">Enter Verification Code</CardTitle>
              <CardDescription>
                We've sent a 6-digit code to your {method === "email" ? "email" : "phone"}
              </CardDescription>
            </>
          )}
          
          {step === "reset" && (
            <>
              <CardTitle className="text-xl text-gray-800">Set New Password</CardTitle>
              <CardDescription>
                Please choose a strong password for your account
              </CardDescription>
            </>
          )}
          
          {step === "success" && (
            <>
              <CardTitle className="text-xl text-green-600">Password Reset Complete</CardTitle>
              <CardDescription>
                Your password has been successfully updated
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "input" && (
            <Tabs value={method} onValueChange={(value) => setMethod(value as ContactMethod)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <FaEnvelope className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <FaMobile className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            We'll send a verification code to this email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12" 
                      disabled={sendOTPMutation.isPending}
                    >
                      {sendOTPMutation.isPending ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                    <FormField
                      control={phoneForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormDescription>
                            We'll send a verification code via SMS
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12" 
                      disabled={sendOTPMutation.isPending}
                    >
                      {sendOTPMutation.isPending ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Code sent to: {contactValue}
                </AlertDescription>
              </Alert>
              
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            {...field}
                            className="h-12 text-center text-lg tracking-widest"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12" 
                    disabled={verifyOTPMutation.isPending}
                  >
                    {verifyOTPMutation.isPending ? "Verifying..." : "Verify Code"}
                  </Button>
                </form>
              </Form>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={resendCode}
                  disabled={sendOTPMutation.isPending}
                  className="text-sm"
                >
                  {sendOTPMutation.isPending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </div>
          )}

          {step === "reset" && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter your 6-digit code"
                          maxLength={6}
                          {...field}
                          className="h-12 text-center text-lg tracking-widest"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12" 
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaLock className="text-green-600 text-2xl" />
              </div>
              <p className="text-gray-600">
                You can now sign in with your new password
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="w-full h-12"
              >
                Go to Login
              </Button>
            </div>
          )}

          {step !== "success" && (
            <div className="text-center">
              <Link href="/login">
                <Button variant="ghost" className="text-sm flex items-center gap-2">
                  <FaArrowLeft className="h-3 w-3" />
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}