import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatWithInventoryAI } from '../utils/geminiClient';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m your Boltic Inventory Assistant. Ask me anything about your stock levels, suppliers, or items.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch inventory on mount so we have context ready
    async function loadInventory() {
        try {
            const res = await fetch('/api/boltic/new-table');
            const json = await res.json();
            if (json.success) setInventory(json.data);
        } catch (e) {
            console.error("Chatbot failed to load context", e);
        }
    }
    loadInventory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMsg = input;
      setInput('');
      setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setLoading(true);

      const response = await chatWithInventoryAI(userMsg, inventory);
      
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-indigo-600 hover:bg-indigo-700'}`}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageSquare className="h-6 w-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-slate-900 dark:ring-slate-800 animate-in fade-in slide-in-from-bottom-10 origin-bottom-right">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-indigo-600 px-4 py-3 text-white rounded-t-2xl dark:border-slate-800">
                <Bot className="h-5 w-5" />
                <span className="font-bold">Boltic AI</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] min-h-[300px]">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none dark:bg-slate-800 dark:text-gray-200'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2 dark:bg-slate-800">
                             <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-gray-100 p-3 dark:border-slate-800 bg-gray-50 rounded-b-2xl dark:bg-slate-900">
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about inventory..."
                        className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !input.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
      )}
    </>
  );
}
