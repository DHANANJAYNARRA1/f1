import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import PdfViewer from '../ui/PdfViewer';
import 'pdfjs-dist/web/pdf_viewer.css';
import { founderOnboardingSchema } from "@shared/schema";

const documentSchema = z.object({
  certificationOfIncorporation: z.any().refine(file => file?.length == 1, 'File is required.'),
  companyOverview: z.any().refine(file => file?.length == 1, 'File is required.'),
  memorandumOfAssociation: z.any().refine(file => file?.length == 1, 'File is required.'),
  businessPlan: z.any().refine(file => file?.length == 1, 'File is required.'),
  pitchDeck: z.any().refine(file => file?.length == 1, 'File is required.'),
  financialModel: z.any().refine(file => file?.length == 1, 'File is required.'),
  intellectualProperty: z.any().refine(file => file?.length == 1, 'File is required.'),
  executiveSummary: z.any().refine(file => file?.length == 1, 'File is required.'),
  marketAnalysis: z.any().refine(file => file?.length == 1, 'File is required.'),
  productRoadmap: z.any().optional(),
  useOfInvestments: z.any().optional(),
});

const documentFields: { name: keyof z.infer<typeof documentSchema>, label: string, required: boolean }[] = [
  { name: 'certificationOfIncorporation', label: 'Certificate of Incorporation', required: true },
  { name: 'companyOverview', label: 'Company Overview', required: true },
  { name: 'memorandumOfAssociation', label: 'Memorandum of Association', required: true },
  { name: 'businessPlan', label: 'Comprehensive Business Plan', required: true },
  { name: 'pitchDeck', label: 'Pitch Deck', required: true },
  { name: 'financialModel', label: 'Detailed Financial Model', required: true },
  { name: 'intellectualProperty', label: 'Intellectual Property (Patents, Trademarks)', required: true },
  { name: 'executiveSummary', label: 'One-Page Executive Summary', required: true },
  { name: 'marketAnalysis', label: 'Market Analysis Reports', required: true },
  { name: 'productRoadmap', label: 'Product Roadmap', required: false },
  { name: 'useOfInvestments', label: 'Use of Investments Breakdown', required: false },
];

interface FounderOnboardingProps {
    userId: string;
    onComplete: () => void;
}

export function FounderOnboarding({ userId, onComplete }: FounderOnboardingProps) {
    const { toast } = useToast();
    const [, navigate] = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const [step, setStep] = useState(1); // 1 = basic info, 2 = pdf upload
    const [basicInfo, setBasicInfo] = useState({ name: '', email: '' });

    const form = useForm({
        resolver: zodResolver(founderOnboardingSchema),
        defaultValues: {
            userId: userId,
        }
    });

    // Step 1: Basic Info Submit
    const handleBasicInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!basicInfo.name || !basicInfo.email) {
            toast({
                variant: 'destructive',
                title: 'Missing Info',
                description: 'Please enter your name and email.'
            });
            return;
        }
        setStep(2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
            if (e.target.files[0].type === 'application/pdf') {
                setPdfPreview(URL.createObjectURL(e.target.files[0]));
            } else {
                setPdfPreview(null);
            }
        }
    };

    // Add all required document field names
    const requiredDocs = [
        'idDocument',
        'businessDocument',
        'pitchDeck',
        'certificationOfIncorporation',
        'companyOverview',
        'memorandumOfAssociation',
        'businessPlan',
        'financialModel',
        'intellectualProperty',
        'executiveSummary',
        'marketAnalysis',
        'productRoadmap',
        'useOfInvestments',
    ];

    // Helper to check if all required files are present
    const allRequiredFilesPresent = requiredDocs.slice(0, 11).every(field => files[field]);

    const onSubmit = async (data: any) => {
        if (!allRequiredFilesPresent) {
            toast({
                variant: 'destructive',
                title: 'Missing Required Documents',
                description: 'Please upload all required documents before submitting.'
            });
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', basicInfo.name);
        formData.append('username', basicInfo.email);
        formData.append('password', data.password || 'changeme'); // Add password field as needed
        formData.append('userType', 'founder');
        for (const field of requiredDocs) {
            if (files[field]) {
                formData.append(field, files[field]!);
            }
        }
        try {
            const response = await apiRequest('/api/auth/register-founder', 'POST', formData) as any;
            if (response.success) {
                toast({
                    title: 'Registration Complete!',
                    description: 'Your application is now under review. We will notify you upon approval.',
                });
                navigate('/auth');
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Submission Failed',
                    description: response.message || 'An unknown error occurred.',
                });
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to submit documents. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Founder Document Submission</CardTitle>
                    <CardDescription>
                        Please upload the following documents. Your profile will not be visible to investors until verified.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                        {step === 1 && (
                            <form onSubmit={handleBasicInfoSubmit} className="space-y-6 md:w-1/2">
                                <div>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        type="text"
                                        value={basicInfo.name}
                                        onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        value={basicInfo.email}
                                        onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">Continue</Button>
                            </form>
                        )}
                        {step === 2 && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:w-1/2">
                                    {requiredDocs.map((field, idx) => (
                                        <div key={field}>
                                            <FormLabel>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</FormLabel>
                                            <input type="file" accept="application/pdf" onChange={e => handleFileChange(e, field)} required={idx < 11} />
                                        </div>
                                    ))}
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Submitting...' : 'Submit Documents for Verification'}
                                    </Button>
                                </form>
                            </Form>
                        )}
                        {step === 2 && (
                            <div className="md:w-1/2">
                                <h3 className="text-lg font-semibold mb-2">PDF Preview</h3>
                                {pdfPreview ? (
                                    <div className="h-[600px] border rounded-md">
                                        <PdfViewer fileUrl={pdfPreview} />
                                    </div>
                                ) : (
                                    <div className="h-[600px] border rounded-md flex items-center justify-center bg-gray-100">
                                        <p className="text-gray-500">Select a PDF file to preview</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 