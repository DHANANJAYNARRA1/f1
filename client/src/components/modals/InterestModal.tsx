import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaEnvelope, FaWhatsapp, FaLinkedin, FaBuilding, FaMoneyBillWave, FaUser, FaCalendarAlt, FaCheck } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import AuthForm from "@/components/auth/AuthForm";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface Product {
    _id: string;
    anonymousId: string;
}

interface InterestModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InterestModal({ product, isOpen, onClose }: InterestModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');

    const mutation = useMutation({
        mutationFn: (newMessage: { productId: string, messageFromInvestor: string }) => apiRequest('POST', '/api/matchmaking/interest-forms', newMessage),
        onSuccess: () => {
            toast({ title: "Success!", description: "Your interest has been submitted to the admin for review." });
            queryClient.invalidateQueries({ queryKey: ['my-interests'] }); // For the investor's "My Interests" page
            onClose();
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message || "Failed to submit interest.", variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        mutation.mutate({ productId: product._id, messageFromInvestor: message });
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Express Interest in {product.anonymousId}</DialogTitle>
                    <DialogDescription>
                        Your message will be sent to an admin for review before being forwarded to the founder. Your identity will remain anonymous.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Tell the founder why you are interested in their product..."
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Interest
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
