"use client";
import { useStartConversationMutation } from "@/app/store/apis/ChatApi";
import useToast from "@/app/hooks/ui/useToast";
import { useRouter } from "next/navigation";
import { MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Seller {
  id: string;
  name: string;
  email: string;
  isSeller: boolean;
  sellerStatus: string;
}

interface ContactSellerButtonProps {
  seller: Seller | null;
  className?: string;
}

const ContactSellerButton: React.FC<ContactSellerButtonProps> = ({ 
  seller, 
  className = "" 
}) => {
  const { showToast } = useToast();
  const router = useRouter();
  const [startConversation, { isLoading }] = useStartConversationMutation();

  const handleContactSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!seller) {
      showToast("Seller information not available", "error");
      return;
    }

    if (!seller.isSeller || seller.sellerStatus !== "APPROVED") {
      showToast("This seller is not available for contact", "error");
      return;
    }

    try {
      const res = await startConversation({ sellerId: seller.id });
      console.log(res);
      
      if (res.data?.success && res.data?.conversation) {
        showToast("Conversation started! Redirecting to chat...", "success");
        // Navigate to the chat page with the specific conversation
        router.push(`/chat/${res.data.conversation.id}`);
      } else {
        showToast("Failed to start conversation", "error");
      }
    } catch (error: any) {
      showToast(error.data?.message || "Failed to contact seller", "error");
      console.error("Error starting conversation:", error);
    }
  };

  // Don't show button if no seller or seller is not approved
  if (!seller || !seller.isSeller || seller.sellerStatus !== "APPROVED") {
    return null;
  }

  return (
    <motion.button
      disabled={isLoading}
      onClick={handleContactSeller}
      className={`w-full py-3 sm:py-4 text-sm sm:text-base font-semibold text-green-600 border-2 border-green-600 rounded-xl transition-all duration-300 hover:bg-green-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed ${className}`}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Starting Conversation...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Contact Seller
        </div>
      )}
    </motion.button>
  );
};

export default ContactSellerButton;