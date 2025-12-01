"use client";

import React from "react";
import AudioPlayer from "../AudioPlayer";
import Image from "next/image";

interface MessageItemProps {
  message: any;
  isCurrentUser: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
}) => {
  // console.log("message => ", message);
  const isImage = message.type === "IMAGE";
  const isAudio = message.type === "VOICE";

  return (
    <div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div className={`group max-w-xs lg:max-w-md xl:max-w-lg`}>
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
          }`}
        >
          {isImage && message.url ? (
            <div className="mb-1">
              <Image
                src={message.url}
                alt="Sent image"
                width={300}
                height={300}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          ) : isAudio && message.url ? (
            <div className="mb-1">
              <AudioPlayer src={message.url} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed break-words">
              {message.content || "No content"}
            </p>
          )}
          
          {/* Timestamp */}
          <div
            className={`text-xs mt-1 flex items-center justify-end gap-1 ${
              isCurrentUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isCurrentUser && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Sender name for other users */}
        {!isCurrentUser && message?.sender?.name && (
          <div className="text-xs text-gray-500 mt-1 ml-1">
            {message.sender.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
