"use client";

import React, { useRef } from "react";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: any[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, message: any) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {Object.entries(groupedMessages).length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Start the conversation with a message</p>
          </div>
        </div>
      ) : (
        Object.entries(groupedMessages).map(
          ([date, dateMessages]: [string, any]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <div className="bg-white text-gray-500 px-3 py-1 rounded-full text-xs shadow-sm border border-gray-200">
                  {date === new Date().toLocaleDateString()
                    ? "Today"
                    : date ===
                      new Date(Date.now() - 86400000).toLocaleDateString()
                    ? "Yesterday"
                    : date}
                </div>
              </div>
               <div className="space-y-2">
                 {dateMessages.map((msg: any, index: number) => (
                   <MessageItem
                     key={`${msg.id}-${index}`}
                     message={msg}
                     isCurrentUser={msg?.sender?.id === currentUserId}
                   />
                 ))}
               </div>
            </div>
          )
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
