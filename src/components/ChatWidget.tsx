'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, User, Minimize2, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sendError, setSendError] = useState('');
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user?.user_metadata?.role !== 'admin') {
        setUser(session.user);
      }
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user?.user_metadata?.role !== 'admin') {
        setUser(session.user);
      } else {
        setUser(null);
        setMessages([]);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchMessages = useCallback(async (pid: string) => {
    try {
      const res = await fetch(`/api/chat?product_id=${pid}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setMessages(result.data);
        const unread = result.data.filter((m: any) => m.sender_role === 'ADMIN' && !m.is_read).length;
        if (!isOpen) {
          setUnreadCount(unread);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch messages', e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    fetchMessages(user.id).finally(() => setIsLoading(false));

    const channel = supabase
      .channel(`chat:user:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `product_id=eq.${user.id}`
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
          if (newMsg.sender_role === 'ADMIN' && !isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedMsg = payload.new;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      })
      .subscribe();

    pollRef.current = setInterval(() => {
      fetchMessages(user.id);
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [user, fetchMessages, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 200);

      // Mark Admin messages as read
      fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', product_id: user.id, role_to_mark: 'ADMIN' })
      }).catch(console.warn);
    }
  }, [isOpen, user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedProduct) || !user || isSending) return;

    const textMsg = newMessage.trim();
    let finalMsg = textMsg;
    
    if (attachedProduct) {
      finalMsg = `[PRODUCT|${attachedProduct.id}|${attachedProduct.name}|${attachedProduct.image}|${attachedProduct.price}]:::${textMsg}`;
    }

    setNewMessage('');
    setAttachedProduct(null);
    setShowProductMenu(false);
    
    // Optimistic UI Update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      sender_role: 'USER',
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
          sender_role: 'USER',
          content: finalMsg,
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          product_id: user.id,
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
    } catch (e: any) {
      console.warn('Failed to send message', e);
      setSendError(e.message || 'Gagal mengirim pesan');
      setTimeout(() => setSendError(''), 4000);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all z-50 hover:scale-110 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-white hover:bg-slate-700'
            : 'bg-gradient-to-br from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700'
        }`}
        aria-label={isOpen ? 'Tutup chat' : 'Buka live chat'}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      <div
        className={`fixed bottom-24 right-6 w-[360px] sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-slate-100 ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-90 opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ height: '540px', maxHeight: '75vh' }}
      >
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg">🧸</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-bold text-sm">CS Simoengil</h3>
              <p className="text-[10px] text-pink-100">Online - Biasanya membalas cepat</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs bg-white border border-slate-200 text-slate-700 shadow-sm">
              <p className="font-semibold text-pink-600 mb-1">Halo, {user.user_metadata?.full_name?.split(' ')[0] || 'kak'}! 👋</p>
              <p>Ada yang bisa kami bantu? Tanya stok, detail boneka, atau pesanan di sini ya 😊</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-pink-500 rounded-full animate-spin" />
                Memuat pesan...
              </div>
            </div>
          )}

          {messages.filter(m => m.sender_role !== 'SYSTEM').map((msg, idx) => (
            <div key={msg.id || idx} className={`flex flex-col ${msg.sender_role === 'USER' ? 'items-end' : 'items-start'}`}>
              {msg.sender_role === 'ADMIN' && (
                <span className="text-[9px] font-bold text-pink-500 mb-1 ml-1">CS Simoengil</span>
              )}
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.sender_role === 'USER'
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
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
                        <div className={`flex items-center gap-3 p-2 rounded-xl border ${msg.sender_role === 'USER' ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
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
                {msg.sender_role === 'USER' && (
                  <span className="ml-1 font-bold">
                    {msg.is_read ? (
                      <span className="text-blue-500">✓✓</span>
                    ) : (
                      <span>✓</span>
                    )}
                  </span>
                )}
              </span>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        <div className="relative shrink-0">
          {showProductMenu && catalogProducts.length > 0 && (
            <div className="absolute bottom-full left-3 mb-2 w-[calc(100%-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
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
            <div className="px-3 pt-3 pb-1 bg-white">
              <div className="flex items-center gap-3 p-2 bg-pink-50 border border-pink-100 rounded-xl relative pr-8">
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

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1">
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
              placeholder={attachedProduct ? "Ketik pesan untuk produk ini..." : "Tulis pesan..."}
              disabled={isSending}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(!newMessage.trim() && !attachedProduct) || isSending}
              className="p-2.5 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 disabled:from-slate-200 disabled:to-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all shrink-0 cursor-pointer active:scale-95"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
