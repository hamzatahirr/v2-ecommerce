"use client";

import React from "react";
import { useGetMyConversationsQuery } from "@/app/store/apis/ChatApi";
import { useGetMeQuery } from "@/app/store/apis/UserApi";
import Link from "next/link";

export default function MessagesPage() {
  const { data: userData } = useGetMeQuery(undefined);
  const user = userData;
  const { data: conversationsData, isLoading } = useGetMyConversationsQuery(undefined);
  const conversations = conversationsData?.conversations || [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">Your conversations with sellers</p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No conversations yet</div>
                <p className="text-gray-400 text-sm mt-2">
                  Start a conversation with a seller to begin messaging
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {conversation.user?.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {conversation.seller?.name || 'Support'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}