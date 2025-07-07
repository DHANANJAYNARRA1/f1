import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import InterestModal from "../modals/InterestModal";
import { useToast } from "@/hooks/use-toast";

interface InterestButtonProps {
  productId: string;
  productName: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function InterestButton({
  productId,
  productName,
  variant = "default",
  size = "default",
  className = "",
}: InterestButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user, expressInterest } = useAuth();
  const { toast } = useToast();

  const handleClick = () => {
    if (!user) {
      // If not logged in, redirect to auth page
      window.location.href = "/auth";
      return;
    }
    
    setShowModal(true);
  };
  
  const handleInterestSubmit = () => {
    expressInterest.mutate({ 
      productId: String(productId),
      source: "direct-interest" 
    }, {
      onSuccess: () => {
        toast({
          title: "Interest Recorded",
          description: `You've expressed interest in ${productName}. Our team will contact you soon!`,
        });
        setShowModal(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to record your interest. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <Button 
        variant={variant} 
        size={size}
        className={className}
        onClick={handleClick}
      >
        I'm Interested
      </Button>
      
      {showModal && (
        <InterestModal
          product={{ _id: productId.toString(), anonymousId: productId.toString() }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}