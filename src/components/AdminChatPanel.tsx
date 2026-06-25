'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, User, Search, RefreshCw, ArrowLeft, Circle, Package, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Conversation {
  user_id: string;
  user_name: string;
  last_message: string;
  last_message_at: string;
  last_sender: string;
  unread: number;
}

export default function AdminChatPanel() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sendError, setSendError] = useState('');
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCatalogProducts = async () => {
      try {
        const { data } = await supabase.from('products').select('id, name, price, image').limit(20);
        if (data) setCatalogProducts(data);
      } catch (e) {
        console.warn(e);
      }
    };
    fetchCatalogProducts();
  }, []);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat?action=conversations');
      const result = await res.json();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (e) {
      console.warn('Failed to fetch conversations', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (pid: string) => {
    try {
      const res = await fetch(`/api/chat?product_id=${pid}`);
      const result = await res.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (e) {
      console.warn('Failed to fetch messages', e);
    }
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    fetchMessages(selectedUser.user_id);

    const channel = supabase
      .channel(`chat:admin:${selectedUser.user_id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `product_id=eq.${selectedUser.user_id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            const tempIndex = prev.findIndex(m => String(m.id).startsWith('temp-') && m.content === newMsg.content);
            if (tempIndex !== -1) {
              const next = [...prev];
              next[tempIndex] = newMsg;
              return next;
            }
            return [...prev, newMsg];
          });

          // Mark as read immediately if it's from user and we are viewing them
          if (newMsg.sender_role === 'USER') {
            fetch('/api/chat', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'mark_read', product_id: selectedUser.user_id })
            }).catch(console.warn);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedMsg = payload.new;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      })
      .subscribe();

    // Mark existing unread messages as read
    fetch('/api/chat', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read', product_id: selectedUser.user_id })
    }).catch(console.warn);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUser, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [selectedUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedProduct) || !selectedUser || isSending) return;

    const textMsg = newMessage.trim();
    let finalMsg = textMsg;

    if (attachedProduct) {
      finalMsg = `[PRODUCT|${attachedProduct.id}|${attachedProduct.name}|${attachedProduct.image}|${attachedProduct.price}]:::${textMsg}`;
    }

    setNewMessage('');
    setAttachedProduct(null);
    setShowProductMenu(false);
    
    // Optimistic UI
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      sender_role: 'ADMIN',
      content: finalMsg,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    setIsSending(true);
    setSendError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: 'ADMIN',
          content: finalMsg,
          user_id: selectedUser.user_id,
          user_name: selectedUser.user_name,
          product_id: selectedUser.user_id,
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengirim pesan');
      }
      const { data } = await res.json();
      if (data) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
      }
      fetchConversations();
    } catch (e: any) {
      console.warn('Failed to send message', e);
      setSendError(e.message || 'Gagal mengirim pesan');
      setNewMessage(textMsg);
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays}h lalu`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Sidebar: Conversation List */}
      <div className={`w-full sm:w-80 border-r border-slate-200 flex flex-col shrink-0 ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">Live Chat</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{conversations.length} percakapan</p>
              </div>
            </div>
            <button
              onClick={fetchConversations}
              disabled={isLoading}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari percakapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-400">Belum ada percakapan</p>
              <p className="text-[10px] text-slate-300 mt-1">Percakapan user akan muncul di sini</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 border-b border-slate-50 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left cursor-pointer ${
                  selectedUser?.user_id === conv.user_id ? 'bg-pink-50 border-l-2 border-l-pink-500' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-800 truncate">{conv.user_name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.unread > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-400">{formatTime(conv.last_message_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {conv.last_sender === 'ADMIN' && (
                      <span className="text-[9px] font-bold text-pink-500">Anda: </span>
                    )}
                    <p className="text-[11px] text-slate-500 truncate">{conv.last_message}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedUser ? 'flex' : 'hidden sm:flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedUser(null)}
                className="sm:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800">{selectedUser.user_name}</h4>
                <div className="flex items-center gap-1.5">
                  <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                  <span className="text-[10px] text-slate-400 font-semibold">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex flex-col ${msg.sender_role === 'ADMIN' ? 'items-end' : 'items-start'}`}>
                  {msg.sender_role !== 'ADMIN' && (
                    <span className="text-[9px] font-bold text-slate-500 mb-1 ml-1">User</span>
                  )}
                  {msg.sender_role === 'ADMIN' && (
                    <span className="text-[9px] font-bold text-pink-500 mb-1 mr-1">Admin</span>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.sender_role === 'ADMIN'
                        ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                    }`}
                  >
                    {msg.content.startsWith('[PRODUCT|') ? (
                      (() => {
                        const [prodStr, textStr] = msg.content.split(':::');
                        const parts = prodStr.split('|');
                        const pName = parts[2];
                        const pImg = parts[3];
                        const pPrice = parts[4]?.replace(']', '');
                        return (
                          <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-3 p-2 rounded-xl border ${msg.sender_role === 'ADMIN' ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                              {pImg && <img src={pImg} alt={pName} className="w-12 h-12 rounded-lg object-cover bg-white shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-[11px] leading-tight mb-0.5 truncate">{pName || 'Produk'}</p>
                                <p className="text-[10px] font-semibold opacity-90">Rp {Number(pPrice || 0).toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                            {textStr && <p className="text-xs break-words">{textStr}</p>}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="break-words">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="relative">
              {showProductMenu && catalogProducts.length > 0 && (
                <div className="absolute bottom-full left-4 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                  {catalogProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                      setAttachedProduct(p);
                      setShowProductMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 cursor-pointer"
                    >
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[9px] text-pink-500 font-semibold">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            
            {attachedProduct && (
              <div className="px-4 pt-4 pb-1 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3 p-2 bg-pink-50 border border-pink-100 rounded-xl relative pr-8 max-w-sm">
                  <img src={attachedProduct.image} alt={attachedProduct.name} className="w-10 h-10 rounded-lg object-cover bg-white shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[11px] text-slate-800 truncate">{attachedProduct.name}</p>
                    <p className="text-[10px] font-semibold text-pink-500">Rp {Number(attachedProduct.price).toLocaleString('id-ID')}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setAttachedProduct(null)} 
                    className="absolute top-2 right-2 p-1 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="p-4 bg-white border-t-0 flex flex-col gap-1 shrink-0">
                {sendError && (
                  <p className="text-[10px] text-red-500 font-semibold px-1">{sendError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProductMenu(!showProductMenu)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl transition-all shrink-0 cursor-pointer flex items-center justify-center"
                    title="Kirim Produk"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                  <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={attachedProduct ? "Ketik pesan untuk produk ini..." : "Ketik balasan..."}
                  disabled={isSending}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !attachedProduct) || isSending}
                  className="px-4 py-2.5 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </div>
            </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-500 text-sm">Pilih Percakapan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-[250px]">
              Pilih percakapan dari daftar di sebelah kiri untuk mulai membalas pesan user
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
