import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userTypeFormSchema, IUserTypeForm } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, LineChart, Building, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface UserTypeFormProps {
  onSubmit: (data: IUserTypeForm) => void;
  onBack: () => void;
  defaultValues?: Partial<IUserTypeForm>;
  isLoading?: boolean;
}

export default function UserTypeForm({ onSubmit, onBack, defaultValues, isLoading = false }: UserTypeFormProps) {
  const form = useForm<IUserTypeForm>({
    resolver: zodResolver(userTypeFormSchema),
    defaultValues: {
      userType: defaultValues?.userType || "founder",
      name: "",
      username: "",
      password: "",
      companyName: "",
      industry: "",
      stage: "",
      fundingNeeded: "",
      investmentRange: "",
      investmentTimeline: "",
      preferredIndustries: "",
      organizationType: "",
      employeeCount: "",
      profession: "",
      interests: "",
      phone: "",
      bio: "",
      otherTypeDesc: "",
      investorType: "",
      investmentFocusIndustry: "",
      investmentFocusStage: "",
      ...defaultValues,
    },
  });

  const watchedUserType = form.watch("userType");

  // Form submission handler
  const handleSubmit = (values: IUserTypeForm) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tell us about yourself</h2>
          <p className="text-gray-500">
            This information helps us personalize your experience and connect you with the right opportunities
          </p>
        </div>

        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>I am a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Card className={`cursor-pointer ${watchedUserType === "founder" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <CardHeader className="pb-2">
                      <Briefcase className="h-6 w-6 text-purple-500" />
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Founder</CardTitle>
                        <RadioGroupItem value="founder" id="founder" className="mt-0" />
                      </div>
                      <CardDescription>
                        I have a startup or business idea to grow
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card className={`cursor-pointer ${watchedUserType === "investor" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <CardHeader className="pb-2">
                      <LineChart className="h-6 w-6 text-indigo-500" />
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Investor</CardTitle>
                        <RadioGroupItem value="investor" id="investor" className="mt-0" />
                      </div>
                      <CardDescription>
                        I'm looking to invest in promising startups
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card className={`cursor-pointer ${watchedUserType === "organization" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <CardHeader className="pb-2">
                      <Building className="h-6 w-6 text-blue-500" />
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Organization</CardTitle>
                        <RadioGroupItem value="organization" id="organization" className="mt-0" />
                      </div>
                      <CardDescription>
                        I represent a company or institution
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card className={`cursor-pointer ${watchedUserType === "mentor" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <CardHeader className="pb-2">
                      <Users className="h-6 w-6 text-yellow-500" />
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Mentor</CardTitle>
                        <RadioGroupItem value="mentor" id="mentor" className="mt-0" />
                      </div>
                      <CardDescription>
                        I want to guide and advise founders
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  
                  <Card className={`cursor-pointer ${watchedUserType === "other" ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                    <CardHeader className="pb-2">
                      <Users className="h-6 w-6 text-green-500" />
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Other</CardTitle>
                        <RadioGroupItem value="other" id="other" className="mt-0" />
                      </div>
                      <CardDescription>
                        I have a different role in the ecosystem
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Dynamic fields based on user type */}
        <div className="space-y-4">
          {/* Common fields for all user types */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 000-0000" {...field} />
                </FormControl>
                <FormDescription>
                  For communication about important updates
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Founder-specific fields */}
          {watchedUserType === "founder" && (
            <>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Startup Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="agriTech">AgriTech</SelectItem>
                          <SelectItem value="healthTech">HealthTech</SelectItem>
                          <SelectItem value="finTech">FinTech</SelectItem>
                          <SelectItem value="eduTech">EduTech</SelectItem>
                          <SelectItem value="medTech">MedTech</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stage</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ideation">Ideation</SelectItem>
                          <SelectItem value="prototype">Prototype</SelectItem>
                          <SelectItem value="mvp">MVP</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="scaling">Scaling</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="fundingNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Required (USD)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select funding range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Not seeking funding yet</SelectItem>
                        <SelectItem value="under100k">Under $100K</SelectItem>
                        <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                        <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                        <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                        <SelectItem value="over5m">Over $5M</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Investor-specific fields */}
          {watchedUserType === "investor" && (
            <>
              <FormField
                control={form.control}
                name="investorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Investor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select your investor type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="angel">Angel / Individual</SelectItem>
                        <SelectItem value="venture_capital">Venture Capital</SelectItem>
                        <SelectItem value="corporate_vc">Corporate VC</SelectItem>
                        <SelectItem value="family_office">Family Office</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investmentFocusIndustry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Focus (Industry)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SaaS, FinTech, HealthTech" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investmentFocusStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Focus (Stage)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a stage" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pre_seed">Pre-Seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series_a">Series A</SelectItem>
                        <SelectItem value="series_b_plus">Series B+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="investmentRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Range (USD)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
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
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="investmentTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Timeline</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
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
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="preferredIndustries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Industries</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List industries you're interested in investing (e.g., AgriTech, FinTech, HealthTech)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Organization-specific fields */}
          {watchedUserType === "organization" && (
            <>
              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                )}
              />
              
              <FormField
                control={form.control}
                name="employeeCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Count</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                )}
              />
            </>
          )}
          
          {/* Other/Mentor-specific fields */}
          {watchedUserType === "mentor" && (
            <>
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                )}
              />
              
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas of Interest/Expertise</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List your areas of interest or expertise" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Other-specific fields */}
          {watchedUserType === "other" && (
            <FormField
              control={form.control}
              name="otherTypeDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Please specify your role</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Service Provider, Student" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Bio field for all user types */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell us a bit about yourself..." 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  This will be shown on your profile
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-between pt-8">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}