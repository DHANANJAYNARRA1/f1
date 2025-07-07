import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const primaryIntents = ["Equity Investment", "Debt Funding", "Strategic Partnership", "Clinical Trials", "Technology Licensing", "Acquisition Interest", "Mentorship/Advisory"];
const areasOfInterest = [
    "Financials & Valuation", "Market Opportunity & Size", "Team & Experience", 
    "Technology & IP", "Product Roadmap", "Customer Acquisition", 
    "Regulatory & Legal", "Exit Strategy", "Sustainability & ESG", 
    "Partnerships & Channels", "Competitor Analysis"
];

interface ExpressInterestModalProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExpressInterestModal({ product, isOpen, onClose }: ExpressInterestModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [primaryIntent, setPrimaryIntent] = useState('');
    const [otherIntent, setOtherIntent] = useState('');
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [specificQuestions, setSpecificQuestions] = useState('');

    const mutation = useMutation({
        mutationFn: (newQuery: any) => apiRequest('POST', '/api/query/investor/express-interest', newQuery),
        onSuccess: () => {
            toast({ title: "Interest Submitted", description: "Your query has been sent to the admin for review." });
            queryClient.invalidateQueries({ queryKey: ['investor-my-interests'] });
            onClose();
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message || "Failed to submit.", variant: "destructive" });
        }
    });

    const handleAreaChange = (area: string) => {
        setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalIntent = primaryIntent === 'Other' ? `Other: ${otherIntent}` : primaryIntent;
        mutation.mutate({ 
            productId: product?._id, 
            productName: product?.name,
            primaryIntent: finalIntent,
            areasOfInterest: selectedAreas,
            originalQuestion: specificQuestions
        });
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Submit Detailed Queries & Investment Intent for {product.name}</DialogTitle>
                    <DialogDescription>
                        Current Product: {product.name} [{product.domain || 'General'}]
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {/* Section 1: Your Primary Intent */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-sm">Section 1: Your Primary Intent</legend>
                        <p className="text-sm text-gray-600 px-2 pb-2">Please choose one option that best describes your interest in this product:</p>
                        <RadioGroup onValueChange={setPrimaryIntent} value={primaryIntent} className="grid grid-cols-2 gap-4 p-2">
                            {primaryIntents.map(intent => (
                                <div key={intent} className="flex items-center space-x-2">
                                    <RadioGroupItem value={intent} id={`intent-${intent}`} />
                                    <Label htmlFor={`intent-${intent}`}>{intent}</Label>
                                </div>
                            ))}
                            <div className="flex items-center space-x-2">
                               <RadioGroupItem value="Other" id="intent-other" />
                               <Label htmlFor="intent-other">Other:</Label>
                               {primaryIntent === 'Other' && <Input value={otherIntent} onChange={e => setOtherIntent(e.target.value)} placeholder="e.g., Market Research Collab" className="ml-2 h-8" />}
                            </div>
                        </RadioGroup>
                    </fieldset>

                    {/* Section 2: Key Areas of Interest / Questions */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-sm">Section 2: Key Areas of Interest / Questions</legend>
                         <p className="text-sm text-gray-600 px-2 pb-2">Select all that apply:</p>
                        <div className="grid grid-cols-2 gap-4 p-2">
                            {areasOfInterest.map(area => (
                                <div key={area} className="flex items-center space-x-2">
                                    <Checkbox id={`area-${area}`} onCheckedChange={() => handleAreaChange(area)} checked={selectedAreas.includes(area)} />
                                    <Label htmlFor={`area-${area}`}>{area}</Label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                    
                    {/* Section 3: Specific Questions / Requirements */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="px-2 font-semibold text-sm">Section 3: Specific Questions / Requirements</legend>
                        <Textarea
                            value={specificQuestions}
                            onChange={(e) => setSpecificQuestions(e.target.value)}
                            placeholder="e.g., What are your financial projections for the next 3 years?"
                            className="mt-2"
                            rows={4}
                        />
                        <p className="text-xs text-red-600 font-semibold mt-2">▲ WARNING: Do not share personal contact info here. It will be filtered.</p>
                    </fieldset>

                    <DialogFooter className="mt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending || !primaryIntent}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Queries
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 