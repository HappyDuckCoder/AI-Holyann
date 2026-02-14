"use client";

import React, { useRef, useEffect, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";

interface MessagesListProps {
    messages: Message[];
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    messagesContainerRef: React.RefObject<HTMLDivElement | null>;
    conversationId?: string;
}

export const MessagesList: React.FC<MessagesListProps> = ({
                                                              messages,
                                                              messagesEndRef,
                                                              messagesContainerRef,
                                                              conversationId,
                                                          }) => {
    const [hasInitialScrolled, setHasInitialScrolled] = useState(false);

    // Reset initial scroll state when conversation changes
    useEffect(() => {
        setHasInitialScrolled(false);
    }, [conversationId]);

    // Handle auto-scroll
    useEffect(() => {
        const container = messagesContainerRef.current;
        const endRef = messagesEndRef.current;

        if (!container || !endRef) return;

        // 1. Initial load scroll (when messages are first loaded for a conversation)
        // We check !hasInitialScrolled to ensure we only force-scroll once per conversation load
        if (!hasInitialScrolled && messages.length > 0) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
                setHasInitialScrolled(true);
            });
            return;
        }

        // 2. New message scroll (only if user is already near bottom)
        if (hasInitialScrolled) {
            const isNearBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight < 200;

            if (isNearBottom) {
                // Smooth scroll for new messages
                setTimeout(() => {
                    endRef.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [messages, conversationId, hasInitialScrolled, messagesContainerRef, messagesEndRef]);

    return (
        <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 bg-gradient-to-b from-muted/30 to-background min-h-0"
        >
            <div className="flex items-center justify-center">
                <div className="px-3 md:px-4 py-1 md:py-1.5 bg-muted rounded-full text-xs text-muted-foreground font-medium">
                    Hôm nay
                </div>
            </div>

            {/* Messages */}
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};