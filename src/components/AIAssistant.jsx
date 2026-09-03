"use client";

import axios from "axios";
import {
    Bot,
    Send,
    Sparkles,
    User,
    Copy, Check
} from "lucide-react";
import { useRef, useState } from "react";


export default function AIAssistant() {

    const textareaRef = useRef(null);

    const [copiedIndex, setCopiedIndex] = useState(null);

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm your Work Ledger AI Assistant. Ask me about workers, payments, pending amounts, and more.",
        },
    ]);

    const [isLoading, setIsLoading] = useState(false);

    const suggestions = [
        "What is my total pending payment?",
        "Give me details of Shastri",
    ];

    const handleCopy = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);

            setCopiedIndex(index);

            setTimeout(() => {
                setCopiedIndex(null);
            }, 1500);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleInputChange = (event) => {
        setInput(event.target.value);

        const textarea = event.target;

        // Reset first so shrinking also works
        textarea.style.height = "auto";

        // Approx 8 rows max
        const maxHeight = 240;

        textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

        textarea.style.overflowY =
            textarea.scrollHeight > maxHeight
                ? "auto"
                : "hidden";
    };

    // --------------------------------
    // Send message
    // --------------------------------

    const handleSend = async (
        customMessage = null
    ) => {
        const userMessage =
            customMessage || input.trim();

        if (!userMessage || isLoading) {
            return;
        }

        // Add user message immediately
        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: userMessage,
            },
        ]);

        setInput("");
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.overflowY = "hidden";
        }

        try {
            const { data } =
                await axios.post(
                    "/api/admin/ai-assistant",
                    {
                        message: userMessage,
                    }
                );

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:
                        data.response ||
                        "I couldn't generate a response.",
                },
            ]);
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Something went wrong. Please try again.";

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: errorMessage,
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // --------------------------------
    // Enter key
    // --------------------------------

    const handleKeyDown = (event) => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            handleSend();
        }
    };

    return (
        <div className="flex h-[calc(100vh-120px)] min-h-[550px] flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">

            {/* Header */}
            <div className="flex items-center gap-3 border-b px-5 py-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                    <Bot className="h-6 w-6" />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-gray-900">
                            Work Ledger AI
                        </h1>

                        <Sparkles className="h-4 w-4 text-gray-500" />
                    </div>

                    <p className="text-sm text-gray-500">
                        Ask about your workers and
                        workforce data
                    </p>
                </div>
            </div>


            {/* Chat area */}
            <div className="flex-1 overflow-y-auto p-5">

                {/* Suggestions */}
                {messages.length === 1 && (
                    <div className="mb-8">

                        <p className="mb-3 text-sm font-medium text-gray-500">
                            Try asking
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {suggestions.map(
                                (suggestion) => (
                                    <button
                                        key={
                                            suggestion
                                        }
                                        onClick={() =>
                                            handleSend(
                                                suggestion
                                            )
                                        }
                                        disabled={
                                            isLoading
                                        }
                                        className="rounded-full border px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {
                                            suggestion
                                        }
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}


                {/* Messages */}
                <div className="space-y-5">
                    {messages.map(
                        (message, index) => {
                            const isUser = message.role ==="user";

                            return (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${
                                        isUser
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >

                                    {/* AI icon */}
                                    {!isUser && (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    )}


                                
                                    {/* Message */}
                                    <div
                                        className={`flex max-w-[75%] flex-col ${
                                            isUser
                                                ? "items-end"
                                                : "items-start"
                                        }`}
                                    >
                                        {/* Message bubble */}
                                        <div
                                            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                                                isUser
                                                    ? "bg-gray-900 text-white"
                                                    : message.isError
                                                    ? "border border-red-200 bg-red-50 text-red-700"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            <p className="whitespace-pre-line">
                                                {message.content}
                                            </p>
                                        </div>
                                         {/*copy button  */}
                                        {
                                            !message.error && (
                                              
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(
                                                        message.content,
                                                        index
                                                    )
                                                }
                                                className="mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                                title="Copy message"
                                            >
                                                {copiedIndex === index ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3.5 w-3.5" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                                )
                                            }
                                    </div>


                                    {/* User icon */}
                                    {isUser && (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                                            <User className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}


                    {/* AI loading */}
                    {isLoading && (
                        <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
                                <Bot className="h-4 w-4" />
                            </div>

                            <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-4">

                                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />

                                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />

                                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />

                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Input */}
            <div className="border-t bg-white p-4 absolute bottom-0 left-0 right-0">

                <div className="flex items-end gap-3 rounded-2xl border bg-gray-50 px-4 py-3 focus-within:ring-2 focus-within:ring-gray-200">

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={
                            handleKeyDown
                        }
                        placeholder="Ask Work Ledger AI..."
                        rows={1}
                        disabled={isLoading}
                        className="max-h-32 min-h-6 flex-1 resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                    />

                    <button
                        onClick={() =>
                            handleSend()
                        }
                        disabled={
                            !input.trim() ||
                            isLoading
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>

                <p className="mt-2 text-center text-xs text-gray-400">
                    AI responses may be inaccurate.
                    Verify important financial data.
                </p>
            </div>
        </div>
    );
}