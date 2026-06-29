'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, User, Minimize2, Maximize2, Package, Trash2, AlertTriangle, Headphones } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import { usePathname } from 'next/navigation';

export function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sendError, setSendError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showProductMenu, setShowProductMenu] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

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
    const initAnonSession = () => {
      let anonId = localStorage.getItem('simoengil_anon_id');
      if (!anonId) {
        anonId = 'anon-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('simoengil_anon_id', anonId);
      }
      setSessionId(anonId);
    };

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user?.user_metadata?.role !== 'admin') {
        setUser(session.user);
        setSessionId(session.user.id);
      } else {
        initAnonSession();
      }
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user?.user_metadata?.role !== 'admin') {
        setUser(session.user);
        setSessionId(session.user.id);
      } else {
        setUser(null);
        initAnonSession();
      }
    });

    const handleNavbarInteraction = () => {
      if (isOpenRef.current) setIsOpen(false);
    };
    window.addEventListener('navbar_interaction', handleNavbarInteraction);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('navbar_interaction', handleNavbarInteraction);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new Event('chat_opened'));
    }
  }, [isOpen]);

  const fetchMessages = useCallback(async (pid: string, offset = 0, limit = 50) => {
    try {
      const res = await fetch(`/api/chat?product_id=${pid}&offset=${offset}&limit=${limit}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        if (offset === 0) {
          setMessages(result.data);
        } else {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = result.data.filter((m: any) => !existingIds.has(m.id));
            return [...newMsgs, ...prev];
          });
        }
        setHasMore(result.data.length === limit);

        const unread = result.data.filter((m: any) => m.sender_role === 'ADMIN' && !m.is_read).length;
        if (!isOpenRef.current) {
          setUnreadCount(unread);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch messages', e);
    }
  }, []);

  const handleLoadMore = async () => {
    if (!sessionId || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchMessages(sessionId, messages.length);
    setIsLoadingMore(false);
  };

  const filteredProducts = catalogProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  useEffect(() => {
    if (!sessionId) return;

    setIsLoading(true);
    fetchMessages(sessionId).finally(() => setIsLoading(false));

    const channel = supabase
      .channel(`chat:user:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `product_id=eq.${sessionId}`
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
          if (newMsg.sender_role === 'ADMIN') {
            playNotificationSound();
            if (!isOpenRef.current) {
              setUnreadCount(prev => prev + 1);
            } else {
              fetch('/api/chat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', product_id: sessionId, role_to_mark: 'ADMIN' })
              }).catch(console.warn);
            }
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedMsg = payload.new;
          setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
        }
      })
      .subscribe();

    pollRef.current = setInterval(() => {
      fetchMessages(sessionId);
    }, 5000);

    return () => {
      channel.unsubscribe();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && sessionId) {
      setUnreadCount(0);
      setTimeout(() => {
        if (window.innerWidth >= 640) {
          inputRef.current?.focus();
        }
      }, 200);

      // Mark Admin messages as read
      fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', product_id: sessionId, role_to_mark: 'ADMIN' })
      }).catch(console.warn);
    }
  }, [isOpen, sessionId]);

  // Handle scroll lock based on interactions and mobile state
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isOpen) {
        document.body.style.overflow = 'auto';
        return;
      }
      
      const isMobile = window.innerWidth < 640;
      if (isExpanded && isMobile) {
        document.body.style.overflow = 'hidden';
        return;
      }

      const chatWidget = document.getElementById('simoengil-chat-widget');
      if (chatWidget && chatWidget.contains(e.target as Node)) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleGlobalClick);
      const isMobile = window.innerWidth < 640;
      if (isExpanded && isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isExpanded]);


  const clearChat = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_chat', product_id: sessionId })
      });
      if (res.ok) {
        setMessages([]);
        setIsDeleteModalOpen(false);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch(e) {
      console.warn("Audio play failed", e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedProduct) || !sessionId || isSending) return;

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
    playNotificationSound();
    
    setIsSending(true);
    setSendError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: 'USER',
          content: finalMsg,
          user_id: user?.id || undefined,
          user_name: user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : 'Guest',
          product_id: sessionId,
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

  if (pathname === '/dashboard' || pathname === '/admin-panel/dashboard') {
    return null;
  }

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
              <span className="absolute -top-3.5 -right-3.5 min-w-[24px] h-[24px] bg-slate-900 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1 animate-bounce border-2 border-white shadow-md">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            id="simoengil-chat-widget"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.2 } }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className={`fixed bg-white shadow-2xl z-50 flex flex-col overflow-hidden origin-bottom-right will-change-transform ${
              isExpanded
                ? 'inset-0 w-full h-full rounded-none border-0 sm:border sm:border-slate-100 sm:top-32 sm:bottom-28 sm:h-auto sm:right-6 sm:left-auto sm:w-[400px] lg:w-[50vw] sm:rounded-3xl'
                : 'bottom-24 right-6 w-[calc(100vw-48px)] sm:w-[400px] rounded-3xl border border-slate-100'
            }`}
            style={!isExpanded ? { height: '540px', maxHeight: '75vh' } : {}}
          >
        {/* Chat Header */}
        <div className="bg-[#0A0F1D] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm">CS Simoengil</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              title={isExpanded ? "Perkecil ukuran" : "Perbesar ukuran"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-white/90" /> : <Maximize2 className="w-4 h-4 text-white/90" />}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              title="Hapus riwayat obrolan"
            >
              <Trash2 className="w-4 h-4 text-white/90" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
              <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-xs">Mulai percakapan dengan CS kami!</p>
            </div>
          )}

          <div className="flex flex-col items-start">
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs bg-white border border-slate-200 text-slate-700 shadow-sm">
              <p className="font-semibold text-pink-600 mb-1">Halo, {user?.user_metadata?.full_name?.split(' ')[0] || 'kak'}! 👋</p>
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

          {hasMore && !isLoading && (
            <div className="flex justify-center my-2">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-[10px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isLoadingMore ? 'Memuat...' : 'Tampilkan pesan sebelumnya'}
              </button>
            </div>
          )}

          {messages.filter(m => m.sender_role !== 'SYSTEM').map((msg, idx) => (
            <div key={msg.id || idx} className={`flex flex-col ${msg.sender_role === 'USER' ? 'items-end' : 'items-start'}`}>
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
                    const pId = parts[1];
                    const pName = parts[2];
                    const pImg = parts[3];
                    const pPrice = parts[4]?.replace(']', '');
                    return (
                      <div className="flex flex-col gap-2">
                        <a 
                          href={`/product/${pId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-2 rounded-xl border hover:opacity-90 transition-opacity cursor-pointer ${msg.sender_role === 'USER' ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-50 border-slate-100 text-slate-800'}`}
                        >
                          {pImg && <img src={pImg} alt={pName} className="w-12 h-12 rounded-lg object-cover bg-white shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[11px] leading-tight mb-0.5 truncate">{pName || 'Produk'}</p>
                            <p className="text-[10px] font-semibold opacity-90">Rp {Number(pPrice || 0).toLocaleString('id-ID')}</p>
                          </div>
                        </a>
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
          {showProductMenu && (
            <div className="absolute bottom-full left-3 mb-2 w-[calc(100%-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-10 flex flex-col">
              <div className="p-2 border-b border-slate-100">
                <input 
                  type="text" 
                  placeholder="Cari boneka..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-pink-400"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAttachedProduct(p);
                      setShowProductMenu(false);
                      setProductSearch('');
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
                {filteredProducts.length === 0 && (
                  <p className="text-[10px] text-slate-400 p-3 text-center">Boneka tidak ditemukan</p>
                )}
              </div>
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
        {isDeleteModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 rounded-3xl">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-center font-bold text-slate-800 text-lg mb-2">Hapus Obrolan?</h3>
              <p className="text-center text-[11px] text-slate-500 mb-6">
                Riwayat obrolan akan dihapus permanen.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={clearChat}
                  className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-red-500/30"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
        </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
