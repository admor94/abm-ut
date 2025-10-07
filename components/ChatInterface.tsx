import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { ChatMessage, StudentData } from '../types';
import { getAiResponse } from '../services/geminiService';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ChatInterfaceProps {
    studentData: StudentData;
    systemPrompt: string;
    chatTitle: string;
    onSessionComplete: (conversation: ChatMessage[]) => void;
    initialConversation?: ChatMessage[];
    filesToAttach?: File[];
}

// FIX: Create an inner component to handle asynchronous markdown parsing.
const MarkdownDisplay: React.FC<{ markdown: string }> = ({ markdown }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        let isMounted = true;
        // marked.parse can return a string or a promise. Wrap in Promise.resolve to handle both cases.
        Promise.resolve(marked.parse(markdown)).then(parsedHtml => {
            if (isMounted && parsedHtml) {
                setHtml(DOMPurify.sanitize(parsedHtml));
            }
        });
        return () => { isMounted = false; };
    }, [markdown]);

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ studentData, systemPrompt, chatTitle, onSessionComplete, initialConversation, filesToAttach }) => {
    const [conversation, setConversation] = useState<ChatMessage[]>(initialConversation || []);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false); // New state for confirmation dialog
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation]);

    // The action that is triggered by the user (button click or Enter press)
    const requestSendMessage = () => {
        if (!userInput.trim() || isLoading) return;
        setShowConfirmation(true);
    };

    // The actual message sending logic, confirmed by the user
    const confirmAndSendMessage = async () => {
        setShowConfirmation(false); // Hide the dialog
        if (!userInput.trim() || isLoading) return;

        const isFirstUserMessage = conversation.filter(m => m.role === 'user').length === 0;

        const newUserMessage: ChatMessage = { 
            role: 'user', 
            text: userInput,
            ...(isFirstUserMessage && filesToAttach && filesToAttach.length > 0 && { files: filesToAttach })
        };
        
        const newConversation = [...conversation, newUserMessage];
        setConversation(newConversation);
        setUserInput('');
        setIsLoading(true);

        try {
            const aiResponseText = await getAiResponse(newConversation, studentData, systemPrompt);
            const aiMessage: ChatMessage = { role: 'model', text: aiResponseText };
            const finalConversation = [...newConversation, aiMessage];
            setConversation(finalConversation);
            onSessionComplete(finalConversation);
        } catch (error) {
            console.error("Error in chat:", error);
            const displayMessage = error instanceof Error ? error.message : 'Maaf, terjadi kesalahan yang tidak diketahui. Coba lagi nanti.';
            const errorMessage: ChatMessage = { role: 'model', text: displayMessage };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            requestSendMessage(); // Show confirmation dialog instead of sending directly
        }
    };

    return (
        <div className="relative flex flex-col h-[60vh] bg-gray-800/50 rounded-lg shadow-inner">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-ut-blue text-white' : 'bg-gray-700 text-gray-200'}`}>
                           {msg.role === 'model' ? (
                            // Use the new async-safe component.
                             <MarkdownDisplay markdown={msg.text} />
                           ) : (
                             <>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.files && msg.files.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-blue-400/50">
                                        <p className="text-xs font-semibold text-blue-200 mb-1">File terlampir:</p>
                                        <ul className="space-y-1">
                                            {msg.files.map((file, i) => (
                                                <li key={i} className="text-xs flex items-center gap-2 bg-black/20 p-1 rounded">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    <span className="truncate">{file.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                             </>
                           )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl p-3 rounded-lg bg-gray-700 text-gray-200">
                           <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 bg-ut-blue rounded-full animate-pulse"></div>
                               <div className="w-2 h-2 bg-ut-blue rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                               <div className="w-2 h-2 bg-ut-blue rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="relative">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik pesan Anda di sini..."
                        rows={1}
                        className="w-full bg-gray-700 text-white rounded-lg p-3 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-ut-blue placeholder:text-gray-500 placeholder:italic"
                        disabled={isLoading}
                    />
                    <button
                        onClick={requestSendMessage} // Show confirmation dialog
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ut-blue hover:bg-ut-blue-light disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </button>
                </div>
            </div>
             {/* Confirmation Dialog */}
            {showConfirmation && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full border border-gray-700">
                        <h3 id="dialog-title" className="text-xl font-semibold font-display text-white mb-4">Konfirmasi Pengiriman Pesan</h3>
                        <div className="bg-gray-900/50 p-4 rounded-md max-h-60 overflow-y-auto mb-6 border border-gray-700">
                            <p className="text-gray-300 whitespace-pre-wrap">{userInput}</p>
                        </div>
                        <div className="flex justify-end gap-4">
                            <button 
                                onClick={() => setShowConfirmation(false)}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={confirmAndSendMessage}
                                className="px-6 py-2 bg-ut-green hover:bg-green-500 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-ut-green"
                            >
                                Kirim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};