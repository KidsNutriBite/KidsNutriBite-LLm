
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NutriGuideChat = ({ onBack }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: "Hello! I'm your NutriGuide Assistant. How can I help you with your family's nutrition today? I can suggest meal plans, explain nutrient benefits, or help with picky eaters.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = (text) => {
        const msgText = text || input;
        if (!msgText.trim()) return;

        const newMsg = {
            id: Date.now(),
            sender: 'user',
            text: msgText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI reply
        setTimeout(() => {
            setIsTyping(false);
            const replyMsg = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "That's a great question. Based on general guidelines, ensuring a balanced intake of proteins and healthy fats is key for development. Would you like some specific recipe ideas?",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, replyMsg]);
        }, 2000);
    };

    const suggestedTopics = [
        "Meal ideas for picky eaters",
        "How much protein does a 5yo need?",
        "Healthy snack alternatives"
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-none rounded-none shadow-none">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 shadow-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">NutriGuide AI</h2>
                            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online & Ready
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-5xl mx-auto w-full space-y-6">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-sm border ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white dark:bg-slate-800 text-purple-600 border-slate-200 dark:border-slate-700'}`}>
                                    <span className="material-symbols-outlined text-sm">{msg.sender === 'user' ? 'person' : 'smart_toy'}</span>
                                </div>

                                {/* Bubble */}
                                <div>
                                    <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`text-[10px] font-medium text-slate-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.time}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex items-end gap-3">
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm text-purple-600">smart_toy</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-200 dark:border-slate-700 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef}></div>
            </div>

            {/* Suggestions */}
            {!input && messages.length < 3 && (
                <div className="px-6 pb-2 flex gap-2 overflow-x-auto custom-scrollbar justify-center bg-slate-50 dark:bg-slate-900/50 pt-2">
                    {suggestedTopics.map((topic, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(topic)}
                            className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-300 text-indigo-600 dark:text-indigo-400 text-xs md:text-sm px-4 py-2 rounded-full whitespace-nowrap shadow-sm transition-colors"
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 max-w-5xl mx-auto w-full">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about nutrition..."
                            className="w-full h-12 pl-4 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-500/20"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </form>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                    NutriGuide AI can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
};

export default NutriGuideChat;
