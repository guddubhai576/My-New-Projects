import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Plus, Link as LinkIcon } from 'lucide-react';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, image?: string, searchChunks?: { title: string, uri: string }[] }>([
    { role: 'assistant', content: 'Hi! I am your AI deepfake detection assistant. Have questions about a result or need help spotting manipulated media?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nsfwModel, setNsfwModel] = useState<nsfwjs.NSFWJS | null>(null);

  useEffect(() => {
    async function loadModel() {
      await tf.ready();
      const loadedNsfw = await nsfwjs.load();
      setNsfwModel(loadedNsfw);
    }
    loadModel();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for Gemini SDK
      const history = messages
        .filter(msg => !msg.image) // exclude image messages from normal text history for simplicity here
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history,
          message: userMessage,
          useSearch: true,
          modelLevel: 'general'
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.text, searchChunks: data.searchChunks }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the AI assistant right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const src = event.target?.result as string;
      
      setMessages(prev => [...prev, { role: 'user', content: `[Uploaded Image: ${file.name}]`, image: src }]);
      setIsTyping(true);
      
      if (!nsfwModel) {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Safety checker model is still loading, please try again in a moment.' }]);
          setIsTyping(false);
          return;
      }

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const predictions = await nsfwModel.classify(img);
        const pornPrediction = predictions.find(p => p.className === 'Porn' || p.className === 'Hentai');
        
        if (pornPrediction && pornPrediction.probability > 0.6) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Privacy Checker: This image contains explicit content and is not acceptable for processing." }]);
        } else {
          // It's safe, let's analyze it with Gemini
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: src.split(',')[1],
              mimeType: file.type,
              prompt: "Please analyze this image and tell me in detail what you see. Focus on identifying any specific objects, text, or notable features."
            })
          });

          const data = await response.json();
          if (data.error) throw new Error(data.error);

          setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        }
      } catch (err) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't verify the safety of this image." }]);
      }
      setIsTyping(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-4 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-slate-900 border border-white/10 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 text-white font-bold tracking-tight">
            <Bot className="w-5 h-5 text-emerald-400" />
            Detection Assistant
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed flex flex-col ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                {msg.image && (
                  <img src={msg.image} alt="uploaded" className="w-full max-w-[150px] rounded-lg mb-2 opacity-80" />
                )}
                {msg.content}
                {msg.searchChunks && msg.searchChunks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/20 flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest opacity-50">Sources:</span>
                    {msg.searchChunks.slice(0, 3).map((chunk, i) => (
                      <a key={i} href={chunk.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-300 hover:text-indigo-200 truncate flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 shrink-0" /> {chunk.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white/10 rounded-tl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 items-center"
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors shrink-0"
              title="Upload image for safety check"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about deepfakes..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all min-w-0"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
