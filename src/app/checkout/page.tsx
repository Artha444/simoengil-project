'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  CreditCard, 
  ShoppingBag, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Smile, 
  Info,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { PRODUCTS, Product } from '@/data/products';
import { CourierResult } from '@/lib/biteship';
import confetti from 'canvas-confetti';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const productId = searchParams.get('product_id');
  const initialVariant = searchParams.get('variant');
  const initialVariantType = searchParams.get('type');

  // Core states
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantSize, setSelectedVariantSize] = useState<string | null>(initialVariant);
  const [selectedVariantType, setSelectedVariantType] = useState<string | null>(initialVariantType);
  const [quantity, setQuantity] = useState(1);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [destinationKeyword, setDestinationKeyword] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Courier/Shipping calculation states
  const [shippingCosts, setShippingCosts] = useState<any[]>([]);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any | null>(null);
  const [isUsingMockShipping, setIsUsingMockShipping] = useState(false);
  
  // Checkout states
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va'>('qris');
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<any>(null);

  // 1. Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthOpen(true);
      } else {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || '');
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || '');
      } else {
        setUser(null);
        setIsAuthOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch Product Info
  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!error && data) {
          const specs = data.specifications || {};
          const mappedProduct: Product = {
            id: String(data.id),
            name: data.name,
            price: Number(data.price),
            category: data.category,
            image: data.image,
            status: data.status,
            description: data.description,
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviews_count || 0),
            shopeeLink: data.shopee_link || data.shopeeLink || '',
            // Removed tokopedia, lazada, tiktok links
            specifications: specs,
            variants: data.variants || []
          };
          setProduct(mappedProduct);
          // Set initial variant size if not provided
          if (!selectedVariantSize && mappedProduct.variants && mappedProduct.variants.length > 0) {
            setSelectedVariantSize(mappedProduct.variants[0].size);
          }
        } else {
          // Fallback to local
          const localProd = PRODUCTS.find(p => p.id === productId);
          if (localProd) {
            setProduct(localProd);
            if (!selectedVariantSize && localProd.variants && localProd.variants.length > 0) {
              setSelectedVariantSize(localProd.variants[0].size);
            }
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 3. Search destination hook
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (destinationKeyword.length >= 3 && !selectedDestination) {
        setIsSearchingDestination(true);
        fetch(`/api/biteship/search?keyword=${encodeURIComponent(destinationKeyword)}`)
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              setDestinations(data.data);
              setShowDestinationDropdown(true);
            }
          })
          .catch(e => console.error(e))
          .finally(() => setIsSearchingDestination(false));
      } else {
        setDestinations([]);
        setShowDestinationDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [destinationKeyword, selectedDestination]);

  // 5. Estimate Product Weight
  const calculateWeightGrams = (): number => {
    if (!product) return 1000;
    
    const nameLower = product.name.toLowerCase();
    const sizeLower = selectedVariantSize?.toLowerCase() || '';

    let baseWeight = 1000; // default 1kg

    if (nameLower.includes('gantungan') || nameLower.includes('keychain') || nameLower.includes('mini')) {
      baseWeight = 150;
    } else if (sizeLower.includes('jumbo') || sizeLower.includes('100cm') || sizeLower.includes('80cm')) {
      baseWeight = 2500;
    } else if (sizeLower.includes('medium') || sizeLower.includes('40cm') || sizeLower.includes('35cm')) {
      baseWeight = 1000;
    } else if (sizeLower.includes('squishy') || sizeLower.includes('30cm')) {
      baseWeight = 700;
    }

    return baseWeight * quantity;
  };

  // 6. Calculate shipping fees when destination is selected
  useEffect(() => {
    if (!selectedDestination) {
      setShippingCosts([]);
      setSelectedShippingOption(null);
      setIsUsingMockShipping(false);
      return;
    }

    const fetchCosts = async () => {
      setIsLoadingCosts(true);
      setSelectedShippingOption(null);
      setIsUsingMockShipping(false);
      const totalWeight = calculateWeightGrams();

      try {
        const res = await fetch('/api/biteship/cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationId: selectedDestination.id,
            weight: totalWeight
          })
        });

        const json = await res.json();
        const options: any[] = [];
        
        if (json.status === 'success' && Array.isArray(json.data)) {
          const hasMock = json.data.some((courier: any) => courier.isMock);
          setIsUsingMockShipping(hasMock);

          json.data.forEach((courier: any) => {
            courier.costs.forEach((service: any) => {
              options.push({
                courierCode: courier.code,
                courierName: courier.name,
                service: service.service,
                description: service.description,
                cost: service.cost,
                etd: service.etd,
                id: `${courier.code}-${service.service}`,
                isMock: courier.isMock
              });
            });
          });

          // Sort options by cheapest cost
          options.sort((a, b) => a.cost - b.cost);
          setShippingCosts(options);
          
          if (options.length > 0) {
            setSelectedShippingOption(options[0]);
          }
        } else {
           setShippingCosts([]);
           setIsUsingMockShipping(false);
        }
      } catch (e) {
        console.error('Failed to calculate shipping fees:', e);
        setIsUsingMockShipping(false);
      } finally {
        setIsLoadingCosts(false);
      }
    };

    fetchCosts();
  }, [selectedDestination, quantity, selectedVariantSize]);

  // Pricing calculations
  const getProductPrice = (): number => {
    if (!product) return 0;
    
    // Find variant price
    if (selectedVariantSize && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.size === selectedVariantSize);
      if (variant && variant.price) {
        return variant.price;
      }
    }
    return product.price;
  };

  const productPrice = getProductPrice();
  const subtotal = productPrice * quantity;
  
  const isJavaOrBali = selectedDestination?.label?.match(/jawa|bali|banten|jakarta|yogyakarta/i);
  const isFreeShippingEligible = subtotal >= 400000 && isJavaOrBali;
  
  const rawShippingFee = selectedShippingOption ? selectedShippingOption.cost : 0;
  const shippingDiscount = (isFreeShippingEligible && rawShippingFee > 0) ? rawShippingFee : 0;
  const shippingFee = rawShippingFee - shippingDiscount;

  const grandTotal = subtotal + shippingFee;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // 7. Place Order and Trigger Midtrans Snap
  const handlePayment = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!name || !phone || !detailAddress || !selectedDestination || !postalCode) {
      alert('Silakan lengkapi data alamat pengiriman Anda!');
      return;
    }

    if (!selectedShippingOption) {
      alert('Silakan pilih opsi kurir pengiriman terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);

    try {
      const cityName = selectedDestination.label;
      const selectedProvince = cityName.split(',').length > 2 ? cityName.split(',')[2].trim() : '';

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const sessionId = localStorage.getItem('simoengil_chat_session');

      const orderPayload = {
        items: [
          {
            id: product?.id,
            name: product?.name,
            size: selectedVariantSize,
            price: productPrice,
            quantity: quantity,
            image: product?.image
          }
        ],
        shippingAddress: {
          name: name,
          phone: phone,
          province: selectedProvince,
          city: cityName,
          detailAddress: detailAddress,
          postalCode: postalCode
        },
        courier: {
          code: selectedShippingOption.courierCode,
          name: selectedShippingOption.courierName,
          service: selectedShippingOption.service,
          cost: shippingFee
        },
        totalPrice: grandTotal,
        sessionId: sessionId
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const json = await res.json();

      if (json.status !== 'success') {
        throw new Error(json.message || 'Gagal membuat transaksi checkout.');
      }

      const snapToken = json.data.token;
      const orderId = json.data.orderId;

      // Check if it is a simulated checkout (when Midtrans credentials are not configure/empty)
      if (json.data.isSimulation) {
        setPlacedOrderId(orderId);
        if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
        setPlacedOrderInfo({
          ...orderPayload,
          orderId: orderId,
          midtransToken: snapToken,
          isSimulation: true
        });
        setOrderSuccess(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setIsSubmitting(false);
        return;
      }

      // Open Midtrans Snap Popup Window
      if ((window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function(result: any) {
            setPlacedOrderId(orderId);
            if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
            setPlacedOrderInfo({
              ...orderPayload,
              orderId: orderId,
              midtransToken: snapToken,
              resultDetails: result
            });
            setOrderSuccess(true);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
          },
          onPending: function(result: any) {
            setPlacedOrderId(orderId);
            if (orderId) localStorage.setItem('simoengil_chat_session', orderId);
            setPlacedOrderInfo({
              ...orderPayload,
              orderId: orderId,
              midtransToken: snapToken,
              isPending: true,
              resultDetails: result
            });
            setOrderSuccess(true);
          },
          onError: function(result: any) {
            alert('Pembayaran ditolak atau terjadi kegagalan. Silakan coba lagi.');
            console.error('Midtrans error:', result);
          },
          onClose: function() {
            alert('Anda menutup popup pembayaran sebelum menyelesaikan transaksi.');
          }
        });
      } else {
        // Fallback if Snap script failed to load (open redirect URL)
        if (json.data.redirectUrl) {
          window.open(json.data.redirectUrl, '_blank');
        } else {
          alert('Snap SDK Midtrans tidak terdeteksi. Silakan muat ulang halaman.');
        }
      }

    } catch (e: any) {
      alert(e.message || 'Gagal memproses pembayaran. Silakan periksa koneksi Anda.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#FFB6C8]/30 border-t-[#FF8FB1] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 mt-4">Memuat detail boneka gemoy...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-[#FFB6C8]/10 space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#FFF5F0] flex items-center justify-center border border-[#FFB6C8]/25 mx-auto text-3xl">🧸</div>
          <h1 className="text-xl font-black text-[#2C2C2C] font-heading">Produk Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500">Pilih boneka dari katalog terlebih dahulu sebelum membeli.</p>
          <Link href="/" className="block w-full py-3 bg-[#FF8FB1] hover:bg-[#FF8FB1]/90 text-white rounded-xl font-bold text-sm text-center">
            Kembali ke Toko
          </Link>
        </div>
      </div>
    );
  }

  // 8. Render Success State
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 max-w-2xl w-full text-center shadow-xl border border-pink-100/50 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#FF8FB1] text-4xl animate-bounce">
            🎉
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 font-heading">Pesanan Berhasil Dibuat!</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {placedOrderInfo?.isPending 
                ? 'Transaksi Anda sedang menunggu pembayaran di Midtrans.'
                : 'Selamat! Boneka Anda siap dipersiapkan untuk diadopsi dan dikirim.'}
            </p>
          </div>

          {/* Order Summary Details */}
          <div className="bg-[#FFF8F3]/60 rounded-3xl p-6 border border-pink-100/30 text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-pink-100/20 text-xs font-bold text-slate-500">
              <span>ID PESANAN</span>
              <span className="text-slate-700 bg-white px-3 py-1 rounded-full border border-pink-100/50 select-all font-mono">
                {placedOrderId}
              </span>
            </div>

            <div className="flex items-start gap-4 py-1">
              <div className="w-16 h-16 rounded-xl bg-white border border-pink-100/50 overflow-hidden shrink-0">
                <img src={product.image} referrerPolicy="no-referrer" alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-slate-800 truncate">{product.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ukuran: {selectedVariantSize || 'Standar'} • Jumlah: {quantity} pcs
                </p>
                <p className="text-xs font-extrabold text-[#FF8FB1] mt-1">{formatIDR(productPrice)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-pink-100/20 space-y-2 text-xs font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Alamat Pengiriman:</span>
                <span className="font-bold text-slate-800 text-right max-w-xs truncate">
                  {placedOrderInfo?.shippingAddress?.name} ({placedOrderInfo?.shippingAddress?.phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kota & Detail:</span>
                <span className="font-bold text-slate-800 text-right max-w-xs truncate">
                  {placedOrderInfo?.shippingAddress?.city}, {placedOrderInfo?.shippingAddress?.detailAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Kurir Ekspedisi:</span>
                <span className="font-bold text-slate-800">
                  {placedOrderInfo?.courier?.name?.split(' ')[0]} ({placedOrderInfo?.courier?.service})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-pink-100/10 text-sm font-extrabold text-slate-800">
                <span>Total Dibayar:</span>
                <span className="text-[#FF8FB1]">{formatIDR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {placedOrderInfo?.isSimulation && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 text-amber-800 text-left text-xs">
              <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold block">Checkout Mode Simulasi</span>
                <p className="leading-relaxed font-medium">
                  Kredensial Midtrans Server Key belum dimasukkan di file `.env.local` server, sehingga pembayaran dijalankan dalam mode demo otomatis.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1 py-4 bg-[#FF8FB1] hover:bg-[#ff7a9f] text-white rounded-2xl font-black text-xs sm:text-sm text-center shadow-md shadow-pink-200 transition-all">
              Belanja Lagi
            </Link>
            <a 
              href={`https://wa.me/6281545585448?text=Halo%20Admin,%20saya%20sudah%20melakukan%20pembayaran%20untuk%20Order%20ID:%20${placedOrderId}.%20Tolong%20segera%20diproses%20ya!%20Terima%20kasih.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 border border-[#FF8FB1] text-[#FF8FB1] hover:bg-[#FFF5F0] rounded-2xl font-black text-xs sm:text-sm text-center transition-all"
            >
              Konfirmasi WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      
      {/* Return link */}
      <div className="mb-8">
        <Link 
          href={`/product/${product.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#FF8FB1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Boneka</span>
        </Link>
      </div>

      <div className="text-center max-w-lg mx-auto mb-12">
        <h1 className="text-3xl font-black text-slate-800 font-heading">Checkout Teman Peluk</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium leading-relaxed">
          Tinggal satu langkah lagi untuk mengadopsi {product.name} kesayanganmu!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Form entry */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Form Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pink-100/50 shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-pink-100/20 text-[#FF8FB1]">
              <MapPin className="w-6 h-6 text-[#E8B37D]" />
              <h2 className="text-lg font-black text-slate-800 font-heading">Alamat Pengiriman</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Nama Penerima
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Artha Gemoy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Cari Kecamatan / Kota
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik nama kecamatan atau kota..."
                  value={selectedDestination ? selectedDestination.label : destinationKeyword}
                  onChange={(e) => {
                    setDestinationKeyword(e.target.value);
                    setSelectedDestination(null);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {isSearchingDestination && (
                  <div className="absolute right-3.5 top-3 w-4.5 h-4.5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              
              {showDestinationDropdown && destinations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-pink-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {destinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="px-4 py-3 hover:bg-pink-50 cursor-pointer text-xs font-medium border-b border-slate-50 last:border-0"
                      onClick={() => {
                        setSelectedDestination(dest);
                        setDestinationKeyword('');
                        setShowDestinationDropdown(false);
                      }}
                    >
                      {dest.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Alamat Lengkap (Jalan, RT/RW, Kecamatan, Perumahan)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Jl. Mawar Indah Blok B4 No. 12, RT 03/RW 04, Kel. Kemang, Kec. Kebayoran Baru"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              />
            </div>

            <div className="w-1/2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Kode Pos
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="12345"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
              />
            </div>
          </div>

          {/* Courier selection section */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pink-100/50 shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-pink-100/20 text-[#FF8FB1]">
              <Truck className="w-6 h-6 text-[#E8B37D]" />
              <h2 className="text-lg font-black text-slate-800 font-heading">Opsi Pengiriman (Biteship)</h2>
            </div>

            {isUsingMockShipping && (
              <div className="bg-[#FFF8F3] border border-[#E8B37D]/35 rounded-2xl p-4 flex gap-3 text-slate-700 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-[#E8B37D] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="font-extrabold text-[#E8B37D] block">Catatan Penting (Mode Simulasi)</span>
                  <p className="leading-relaxed font-semibold text-slate-600">
                    Biteship API Key Anda saat ini tidak memiliki saldo yang cukup (balance 0) untuk memanggil API rates secara live.
                  </p>
                  <p className="leading-relaxed text-slate-500 font-medium">
                    Sistem secara otomatis mengaktifkan <strong>tarif simulasi (JNE, SiCepat, J&T)</strong> agar transaksi di toko Anda tetap berjalan dengan lancar tanpa hambatan!
                  </p>
                  <p className="text-[10px] text-[#E8B37D] font-extrabold pt-1">
                    👉 Silakan lakukan top up saldo di dashboard Biteship Anda untuk mengaktifkan tarif asli secara otomatis.
                  </p>
                </div>
              </div>
            )}

            {!selectedDestination ? (
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 text-xs sm:text-sm text-slate-400 font-medium">
                Pilih Kecamatan/Kota terlebih dahulu untuk menghitung ongkos kirim.
              </div>
            ) : isLoadingCosts ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-bold">Mengkalkulasi ongkos kirim POS, JNE, dan TIKI...</p>
              </div>
            ) : shippingCosts.length === 0 ? (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-semibold">
                Gagal memuat ongkos kirim kurir. Silakan pilih kembali kota tujuan Anda.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[#E8B37D] uppercase tracking-widest mb-1.5 block">Opsi Kurir Tersedia:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {shippingCosts.map((option, index) => {
                    const isSelected = selectedShippingOption?.id === option.id;
                    const isCheapest = index === 0;
                    const isFastest = option.etd.includes('1') && !option.etd.includes('10');

                    return (
                      <label
                        key={option.id}
                        className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                          isSelected
                            ? 'bg-[#FFF5F0] border-[#FFB6C8] shadow-xs'
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shippingOption"
                            className="mt-1 accent-[#FF8FB1]"
                            checked={isSelected}
                            onChange={() => setSelectedShippingOption(option)}
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-1 mb-1">
                              <span className="text-[10px] font-black bg-pink-100 text-[#FF8FB1] px-2 py-0.5 rounded border border-[#FFB6C8]/40 uppercase tracking-wide">
                                {option.courierCode.toUpperCase()}
                              </span>
                              {isCheapest && (
                                <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                                  Paling Hemat
                                </span>
                              )}
                              {isFastest && !isCheapest && (
                                <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                                  Paling Cepat
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-slate-800 block">
                              {option.service}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[200px]">
                              {option.description}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-[#FF8FB1] block">
                            {formatIDR(option.cost)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            Estimasi: {option.etd.toLowerCase().replace('hari', '')} Hari
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Payment Method simulation */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pink-100/50 shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-pink-100/20 text-[#FF8FB1]">
              <CreditCard className="w-6 h-6 text-[#E8B37D]" />
              <h2 className="text-lg font-black text-slate-800 font-heading">Metode Pembayaran (Snap Midtrans)</h2>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilih Preferensi Pembayaran untuk Panduan:</p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* QRIS */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    paymentMethod === 'qris'
                      ? 'bg-[#FFF8F3] border-[#E8B37D] shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800">QRIS / E-Wallet</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">GoPay, ShopeePay, OVO, Dana</p>
                  </div>
                  <span className="text-xl">📱</span>
                </button>

                {/* Virtual Account */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('va')}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition-all duration-300 flex items-center justify-between ${
                    paymentMethod === 'va'
                      ? 'bg-[#FFF8F3] border-[#E8B37D] shadow-xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-800">Virtual Account</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">BCA, Mandiri, BNI, BRI, Permata</p>
                  </div>
                  <span className="text-xl">💳</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Cart Summary */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
          
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pink-100/50 shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-pink-100/20 text-[#FF8FB1]">
              <ShoppingBag className="w-6 h-6 text-[#E8B37D]" />
              <h2 className="text-lg font-black text-slate-800 font-heading">Ringkasan Pesanan</h2>
            </div>

            {/* Product description card */}
            <div className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-pink-100/30 shrink-0">
                <img src={product.image} referrerPolicy="no-referrer" alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 truncate">{product.name}</h4>
                  {(selectedVariantType || selectedVariantSize) && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedVariantType && (
                        <span className="text-[9px] font-black text-[#E8B37D] bg-[#FFF8F3] px-2 py-0.5 rounded border border-[#E8B37D]/20">
                          Variasi: {selectedVariantType}
                        </span>
                      )}
                      {selectedVariantSize && (
                        <span className="text-[9px] font-black text-[#E8B37D] bg-[#FFF8F3] px-2 py-0.5 rounded border border-[#E8B37D]/20">
                          Ukuran: {selectedVariantSize}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Quantity adjuster */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(quantity - 1)}
                      className="w-6 h-6 bg-white hover:bg-slate-100 border border-slate-200 rounded-full font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-slate-700">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-6 h-6 bg-white hover:bg-slate-100 border border-slate-200 rounded-full font-bold text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs font-black text-slate-800">{formatIDR(productPrice)}</span>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="space-y-3.5 text-xs font-medium text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal Produk:</span>
                <span className="font-bold text-slate-800">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimasi Biaya Pengiriman:</span>
                {selectedShippingOption ? (
                  <div className="text-right flex flex-col items-end gap-1">
                    {shippingDiscount > 0 ? (
                      <>
                        <span className="line-through text-slate-400 text-[10px]">{formatIDR(rawShippingFee)}</span>
                        <span className="font-bold text-emerald-500">Gratis!</span>
                      </>
                    ) : (
                      <span className="font-bold text-slate-800">{formatIDR(shippingFee)}</span>
                    )}
                  </div>
                ) : (
                  <span className="font-bold text-slate-800">Pilih Kurir</span>
                )}
              </div>
              
              <div className="pt-4 border-t border-pink-100/20 flex justify-between items-center text-sm font-extrabold text-slate-800">
                <span>Total Bayar:</span>
                <span className="text-lg text-[#FF8FB1]">{formatIDR(grandTotal)}</span>
              </div>
            </div>
            
            <div className="bg-[#FFF8F3] border border-pink-100/40 p-4 rounded-xl space-y-2 mt-4 text-[10px] text-slate-500 font-medium leading-relaxed">
              <p className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#E8B37D] shrink-0 mt-0.5" />
                <span>Ongkir yang tertera adalah <strong>estimasi terbaik</strong> (sudah termasuk margin packing aman bubble wrap tebal).</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Ongkir final akan disesuaikan setelah kami cek berat paket riil. Kami akan konfirmasi ongkir final via WhatsApp maksimal 1x24 jam setelah order jika ada penyesuaian.</span>
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handlePayment}
              disabled={isSubmitting || !selectedShippingOption}
              className="w-full py-4 bg-[#FF8FB1] hover:bg-[#ff7a9f] text-white rounded-2xl font-black text-sm transition-all shadow-md shadow-pink-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Pembayaran...</span>
                </>
              ) : (
                <>
                  <span>Bayar Sekarang</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="pt-2 flex flex-col gap-2.5 text-[10px] font-semibold text-slate-400 bg-[#FFF5F0]/40 p-4 rounded-2xl border border-pink-100/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF8FB1] shrink-0" />
                <span className="text-slate-600 font-bold">Gratis Ongkir untuk pembelian di atas Rp400.000 (Khusus Jawa & Bali)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Transaksi Terenkripsi Aman & Didukung oleh Midtrans</span>
              </div>
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#E8B37D] shrink-0" />
                <span>Garansi Uang Kembali 100% jika Boneka Rusak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF8F3] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#FFB6C8]/30 border-t-[#FF8FB1] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 mt-4">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
