"use client";

import React from "react";
import { User, Store, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
  chat: any;
  onResolve: () => void;
  canResolve: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  onResolve,
  canResolve,
}) => {
  const router = useRouter();
  
  const participantName = chat?.seller?.name || chat?.user?.name || 'Support';
  const isSeller = !!chat?.seller;
  
  const handleBack = () => {
    router.push('/chat');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {/* Back button for mobile */}
          <button
            onClick={handleBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            {isSeller ? (
              <Store className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          
          {/* Chat info */}
          <div>
            <h2 className="font-semibold text-gray-900">{participantName}</h2>
            <div className="flex items-center text-sm">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                  chat?.status === "OPEN" ? "bg-green-500" : "bg-gray-400"
                } ${chat?.status === "OPEN" ? "animate-pulse" : ""}`}
              ></span>
              <span className="text-gray-600">
                {chat?.status === "OPEN" ? "Active" : "Closed"}
              </span>
              {isSeller && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  Seller
                </span>
              )}
            </div>
          </div>
        </div>
        
        {canResolve && (
          <button
            onClick={onResolve}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-full text-sm font-semibold text-white transition-colors duration-200 flex items-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Resolve</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
