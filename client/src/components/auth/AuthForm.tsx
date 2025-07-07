// ADMIN CREDENTIALS (for development only, not shown to users):
// Email: admin@example.com
// Password: admin123
// These credentials are hardcoded in the backend (see createAdmin.js/resetAdmin.js)
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTypeForm from './UserTypeForm';
import { FounderOnboarding } from './FounderOnboarding';
import ForgotPasswordForm from './ForgotPasswordForm';
import { IUser, IUserTypeForm } from "@shared/schema";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const loginSchema = z.object({
  login: z.string().min(1, { message: "Username or email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const allowedUserTypes = ["founder", "investor", "organization", "mentor", "other"] as const;
type UserType = typeof allowedUserTypes[number];

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(allowedUserTypes, { required_error: 'User type is required' }),
  phone: z.string().optional(),
  bio: z.string().optional(),
  industry: z.string().optional(),
  companyName: z.string().optional(),
  stage: z.string().optional(),
  fundingNeeded: z.string().optional(),
  investmentRange: z.string().optional(),
  investmentTimeline: z.string().optional(),
  preferredIndustries: z.string().optional(),
  organizationType: z.string().optional(),
  employeeCount: z.string().optional(),
  profession: z.string().optional(),
  interests: z.string().optional(),
  manualPitchDeck: z.string().optional(),
});

export function AuthForm() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState<'register' | 'upload' | 'pending'>('register');
  const [registeredFounder, setRegisteredFounder] = useState<any>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      password: '',
      userType: undefined,
      phone: '',
      bio: '',
      industry: '',
      companyName: '',
      stage: '',
      fundingNeeded: '',
      investmentRange: '',
      investmentTimeline: '',
      preferredIndustries: '',
      organizationType: '',
      employeeCount: '',
      profession: '',
      interests: '',
      manualPitchDeck: '',
    },
  });
  const [docFiles, setDocFiles] = useState<{ [key: string]: File | undefined }>({});
  const watchedUserType = signupForm.watch('userType');
  const documentFields = [
    { key: 'idDocument', label: 'Personal ID Document (PDF)' },
    { key: 'businessDocument', label: 'Business Registration Document (PDF)' },
    { key: 'pitchDeck', label: 'Pitch Deck (PDF)' },
    { key: 'certificationOfIncorporation', label: 'Certificate of Incorporation (PDF)' },
    { key: 'companyOverview', label: 'Company Overview (PDF)' },
    { key: 'memorandumOfAssociation', label: 'Memorandum of Association (PDF)' },
    { key: 'businessPlan', label: 'Comprehensive Business Plan (PDF)' },
    { key: 'financialModel', label: 'Detailed Financial Model (PDF)' },
    { key: 'intellectualProperty', label: 'Intellectual Property (PDF)' },
    { key: 'executiveSummary', label: 'One-Page Executive Summary (PDF)' },
    { key: 'marketAnalysis', label: 'Market Analysis Reports (PDF)' },
    { key: 'productRoadmap', label: 'Product Roadmap (PDF)' },
    { key: 'useOfInvestments', label: 'Use of Investments Breakdown (PDF)' },
  ];
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  console.log(`%c[RENDER] AuthForm rendering. Step: ${step}, Registered Founder: ${!!registeredFounder}`, 'color: blue; font-weight: bold;');

  useEffect(() => {
    if (user && user.userType !== 'founder') {
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.isAdmin) navigate('/admin');
      else if (user.userType === 'investor') navigate('/investor-dashboard');
      else navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    await loginMutation.mutateAsync({ username: data.login, password: data.password });
    toast({ title: "Login successful!" });
  };

  const handleDocChange = (key: string, file: File | undefined) => {
    setDocFiles(prev => ({ ...prev, [key]: file }));
  };

  useEffect(() => {
    if ((activeTab === 'signup' || activeTab === 'login') && step !== 'pending') {
      setStep('register');
      setRegisteredFounder(null);
      setRegisterError(null);
      setUploadError(null);
      setDocFiles({});
    }
  }, [activeTab, step]);

  if (showForgotPassword) {
    return <ForgotPasswordForm onComplete={() => setShowForgotPassword(false)} />;
  }

  // Registration step
  if (step === 'register') {
    // Helper to check if all required files are present
    const allRequiredFilesPresent = documentFields.slice(0, 11).every(f => docFiles[f.key]);

    return (
      <Card className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <CardHeader><CardTitle>Login</CardTitle></CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  {/* Login Form Fields */}
                  <FormField control={loginForm.control} name="login" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showLoginPassword ? "text" : "password"} {...field} />
                          <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowLoginPassword(v => !v)} tabIndex={-1}>
                            {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button variant="link" onClick={() => setShowForgotPassword(true)}>Forgot Password?</Button>
            </CardFooter>
          </TabsContent>
          <TabsContent value="signup">
            <CardHeader><CardTitle>Create an Account</CardTitle></CardHeader>
            <CardContent>
              <Form {...signupForm}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setRegisterError(null);
                    if (watchedUserType === 'founder') {
                      const missingDocs = documentFields.filter(f => !docFiles[f.key]);
                      if (missingDocs.length > 0) {
                        setRegisterError('Please upload all required documents.');
                        return;
                      }
                      for (const f of documentFields) {
                        const file = docFiles[f.key];
                        if (file && (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024)) {
                          setRegisterError(`File for ${f.label} must be a PDF and less than 5MB.`);
                          return;
                        }
                      }
                    }
                    // Prepare FormData
                    const formData = new FormData();
                    Object.entries(signupForm.getValues()).forEach(([key, value]) => {
                      formData.append(key, value as string);
                    });
                    documentFields.forEach(({ key }) => {
                      if (docFiles[key]) formData.append(key, docFiles[key]!);
                    });
                    // Submit registration + docs
                    try {
                      const res = await fetch('/api/auth/register-founder', {
                        method: 'POST',
                        body: formData,
                      });
                      let result;
                      try {
                        result = await res.json();
                      } catch (jsonErr) {
                        // If response is not JSON (e.g., HTML error page)
                        setRegisterError('Registration failed. Please try again later or contact support.');
                        return;
                      }
                      if (result.success) {
                        setStep('pending');
                      } else {
                        setRegisterError(result.message || 'Failed to create account.');
                      }
                    } catch (err: any) {
                      setRegisterError(err.message || 'Failed to create account.');
                    }
                  }}
                  className="space-y-4"
                  encType="multipart/form-data"
                >
                  {/* Registration fields */}
                  <FormField control={signupForm.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showSignupPassword ? "text" : "password"} placeholder="Password" {...field} />
                          <button type="button" className="absolute right-2 top-2 text-gray-400" onClick={() => setShowSignupPassword(v => !v)} tabIndex={-1}>
                            {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="userType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Select user type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="founder">Founder</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                            <SelectItem value="mentor">Mentor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {/* Common fields for all user types */}
                  <FormField control={signupForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+1 (555) 000-0000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {/* Investor-specific fields */}
                  {watchedUserType === 'investor' && (
                    <>
                      <FormField control={signupForm.control} name="investmentRange" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Range (USD)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select investment range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under50k">Under $50K</SelectItem>
                              <SelectItem value="50k-100k">$50K - $100K</SelectItem>
                              <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                              <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                              <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                              <SelectItem value="over5m">Over $5M</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signupForm.control} name="investmentTimeline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investment Timeline</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediate">Ready to invest immediately</SelectItem>
                              <SelectItem value="3months">Within 3 months</SelectItem>
                              <SelectItem value="6months">Within 6 months</SelectItem>
                              <SelectItem value="1year">Within 1 year</SelectItem>
                              <SelectItem value="exploring">Just exploring opportunities</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signupForm.control} name="preferredIndustries" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Industries</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List industries you're interested in investing (e.g., AgriTech, FinTech, HealthTech)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}
                  {/* Organization-specific fields */}
                  {watchedUserType === 'organization' && (
                    <>
                      <FormField control={signupForm.control} name="organizationType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select organization type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="corporation">Corporation</SelectItem>
                              <SelectItem value="nonprofit">Non-profit</SelectItem>
                              <SelectItem value="government">Government</SelectItem>
                              <SelectItem value="educational">Educational Institution</SelectItem>
                              <SelectItem value="accelerator">Accelerator/Incubator</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signupForm.control} name="employeeCount" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee Count</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select employee count" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-500">201-500</SelectItem>
                              <SelectItem value="501-1000">501-1000</SelectItem>
                              <SelectItem value="1000+">1000+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}
                  {/* Mentor-specific fields */}
                  {watchedUserType === 'mentor' && (
                    <>
                      <FormField control={signupForm.control} name="profession" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select profession" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="mentor">Mentor</SelectItem>
                              <SelectItem value="advisor">Advisor</SelectItem>
                              <SelectItem value="consultant">Consultant</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="academic">Academic</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signupForm.control} name="interests" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Interest/Expertise</FormLabel>
                          <FormControl>
                            <Textarea placeholder="List your areas of interest or expertise" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}
                  {/* Founder-specific PDF upload fields */}
                  {watchedUserType === 'founder' && (
                    <>
                      <div className="mt-6">
                        <h4 className="font-bold mb-2">Required Documents</h4>
                        <p className="text-sm text-gray-600 mb-2">Please upload your Business Registration Certificate and Founder's ID in PDF format. Max file size: 5MB per document.</p>
                        {documentFields.map(({ key, label }) => (
                          <div key={key} className="mb-2">
                            <FormLabel>{label}</FormLabel>
                            <Input
                              type="file"
                              accept="application/pdf"
                              onChange={e => handleDocChange(key, e.target.files?.[0])}
                            />
                            {docFiles[key] && (
                              <span className="ml-2 text-green-700 text-xs">{docFiles[key]!.name} ({(docFiles[key]!.size / 1024 / 1024).toFixed(2)} MB)</span>
                            )}
                            {!docFiles[key] && (
                              <span className="ml-2 text-red-500 text-xs">Not uploaded</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Pre-submission review */}
                      <div className="mt-4">
                        <h5 className="font-semibold mb-1">Review Uploaded Files</h5>
                        <ul className="text-xs text-gray-700">
                          {documentFields.map(({ key, label }) => (
                            <li key={key}>
                              {label}: {docFiles[key] ? <span className="text-green-700">{docFiles[key]!.name}</span> : <span className="text-red-500">Not uploaded</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      (watchedUserType === 'founder' && Object.values(docFiles).some(f => !f)) || signupForm.formState.isSubmitting
                    }
                  >
                    Create Account
                  </Button>
                </form>
              </Form>
              {registerError && <div className="text-red-600 text-center mb-2">{registerError}</div>}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  // PDF upload step
  if (step === 'upload' && registeredFounder) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Upload Required Documents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentFields.map(({ key, label }) => (
              <div key={key}>
                <FormLabel>{label}</FormLabel>
                <Input type="file" accept="application/pdf" onChange={e => handleDocChange(key, e.target.files?.[0])} />
              </div>
            ))}
            <Button className="w-full mt-4" onClick={async () => {
              setUploadError(null);
              const formData = new FormData();
              documentFields.forEach(({ key }) => {
                if (docFiles[key]) formData.append(key, docFiles[key]!);
              });
              formData.append('userId', registeredFounder._id || registeredFounder.id);
              const uploadRes = await fetch('/api/auth/founder-documents', {
                method: 'POST',
                body: formData,
                credentials: 'include',
              });
              const uploadResult = await uploadRes.json();
              if (uploadResult.success) {
                setStep('pending');
              } else {
                setUploadError(uploadResult.message || 'Failed to upload documents');
              }
            }}>Submit Documents</Button>
            {uploadError && <div className="text-red-600 text-center mb-2">{uploadError}</div>}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending review step
  if (step === 'pending') {
    return (
      <Card className="w-full max-w-md mt-6">
        <CardHeader><CardTitle>Application Pending Review</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-2">Thank you for submitting your documents!</p>
            <p>Your application is under review by our admin team. You will be notified once your account is approved.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
