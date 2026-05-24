'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or get session ID for the anonymous user
    let sid = localStorage.getItem('simoengil_chat_session');
    if (!sid) {
      sid = 'session-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('simoengil_chat_session', sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('product_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          setMessages(data);
        }
      } catch (e) {
        console.warn('Failed to fetch messages', e);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `product_id=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId) return;

    const msg = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: 'USER',
          content: msg,
          product_id: sessionId
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
    } catch (e) {
      console.warn('Failed to send message', e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl bg-pink-500 text-white hover:bg-pink-600 transition-all z-50 hover:scale-110 active:scale-95 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl z-50 flex flex-col transition-all origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        
        {/* Header */}
        <div className="bg-pink-500 text-white p-4 rounded-t-3xl flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">CS Simoengil</h3>
              <p className="text-[10px] text-pink-100">Biasanya membalas dalam beberapa menit</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] px-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm">
              Halo! Ada yang bisa kami bantu? Jika ingin tanya stok atau detail boneka, silakan chat di sini ya 😊
            </div>
          </div>
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender_role === 'USER' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs shadow-sm ${msg.sender_role === 'USER' ? 'bg-pink-500 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                {msg.content}
              </div>
              <span className="text-[8px] text-slate-400 mt-1">
                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-3 bg-white rounded-b-3xl border-t border-slate-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-200 transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </>
  );
}
