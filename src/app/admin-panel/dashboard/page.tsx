'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PRODUCTS, Product, ProductVariant } from '@/data/products';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Undo, 
  LayoutDashboard, 
  ShoppingBag, 
  LogOut, 
  Sparkles, 
  AlertTriangle,
  List,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Boneka Beruang');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Best Seller' | 'Stok Terbatas' | 'Baru' | 'Promo'>('Baru');
  const [description, setDescription] = useState('');
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Platform Links & Prices
  const [shopeeLink, setShopeeLink] = useState('');
  const [tokopediaLink, setTokopediaLink] = useState('');
  const [lazadaLink, setLazadaLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [shopeePrice, setShopeePrice] = useState('');
  const [tokopediaPrice, setTokopediaPrice] = useState('');
  const [lazadaPrice, setLazadaPrice] = useState('');
  const [tiktokPrice, setTiktokPrice] = useState('');

  // Platform Availability Checks (Default to true)
  const [shopeeAvailable, setShopeeAvailable] = useState<boolean>(true);
  const [tokopediaAvailable, setTokopediaAvailable] = useState<boolean>(true);
  const [lazadaAvailable, setLazadaAvailable] = useState<boolean>(true);
  const [tiktokAvailable, setTiktokAvailable] = useState<boolean>(true);

  // Dynamic Categories Creator states
  const [categoriesList, setCategoriesList] = useState<string[]>(['Boneka Beruang', 'Gantungan Kunci', 'Kado Wisuda']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  // Tab State
  const [activeTab, setActiveTab] = useState<'katalog' | 'halaman'>('katalog');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Site Settings States
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImage1, setHeroImage1] = useState('');
  const [heroImage2, setHeroImage2] = useState('');
  const [heroBadge1Icon, setHeroBadge1Icon] = useState('');
  const [heroBadge1Text, setHeroBadge1Text] = useState('');
  const [heroBadge2Icon, setHeroBadge2Icon] = useState('');
  const [heroBadge2Text, setHeroBadge2Text] = useState('');
  const [logoTextMain, setLogoTextMain] = useState('');
  const [logoTextSub, setLogoTextSub] = useState('');
  const [logoIcon, setLogoIcon] = useState('');
  const [logoImageType, setLogoImageType] = useState('icon');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [whyTitle, setWhyTitle] = useState('');
  const [whyFeatures, setWhyFeatures] = useState<any[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Additional Images & Features state
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  // Scan and merge categories from existing products list
  useEffect(() => {
    if (products.length > 0) {
      const existingCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
      setCategoriesList(prev => Array.from(new Set([...prev, ...existingCats])));
    }
  }, [products]);

  // Authentication Guard Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // If supabase url is dummy, we allow accessing dashboard for demonstration purposes in local development
          const isDummyUrl = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id');
          if (isDummyUrl) {
            console.log('Using dummy Supabase URL. Bypassing auth guard for preview mode.');
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            router.push('/secret-login');
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.push('/secret-login');
      }
    };
    checkAuth();
  }, [router]);

  // Fetch Products
  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        // Map snake_case database rows back to typescript properties if necessary
        const mappedData = data.map((item: any) => {
          const specs = item.specifications || {};
          return {
            id: String(item.id),
            name: item.name,
            price: Number(item.price),
            category: item.category,
            image: item.image,
            status: item.status,
            description: item.description,
            rating: Number(item.rating || 5.0),
            reviewsCount: Number(item.reviews_count || 0),
            shopeeLink: item.shopee_link || item.shopeeLink || '',
            tokopediaLink: item.tokopedia_link || item.tokopediaLink || '',
            lazadaLink: specs.lazadaLink || item.lazadaLink || '',
            tiktokLink: specs.tiktokLink || item.tiktokLink || '',
            shopeePrice: specs.shopeePrice || item.shopeePrice || undefined,
            tokopediaPrice: specs.tokopediaPrice || item.tokopediaPrice || undefined,
            lazadaPrice: specs.lazadaPrice || item.lazadaPrice || undefined,
            tiktokPrice: specs.tiktokPrice || item.tiktokPrice || undefined,
            shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
            tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
            lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
            tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
            images: specs.images || item.images || [],
            specifications: {
              material: specs.material || '100% Premium Dacron & Kain Rasfur',
              size: specs.size || 'Standard',
              washing: specs.washing || 'Bisa dicuci mesin',
              safeForKids: specs.safeForKids !== undefined ? specs.safeForKids : true,
              lazadaLink: specs.lazadaLink || '',
              tiktokLink: specs.tiktokLink || '',
              shopeePrice: specs.shopeePrice || undefined,
              tokopediaPrice: specs.tokopediaPrice || undefined,
              lazadaPrice: specs.lazadaPrice || undefined,
              tiktokPrice: specs.tiktokPrice || undefined,
              shopeeAvailable: specs.shopeeAvailable !== undefined ? specs.shopeeAvailable : true,
              tokopediaAvailable: specs.tokopediaAvailable !== undefined ? specs.tokopediaAvailable : true,
              lazadaAvailable: specs.lazadaAvailable !== undefined ? specs.lazadaAvailable : true,
              tiktokAvailable: specs.tiktokAvailable !== undefined ? specs.tiktokAvailable : true,
              images: specs.images || [],
            },
            variants: (item.variants || []).map((v: any) => ({
              ...v,
              shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
              tokopediaAvailable: v.tokopediaAvailable !== undefined ? v.tokopediaAvailable : true,
              lazadaAvailable: v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
              tiktokAvailable: v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
            }))
          };
        });
        setProducts(mappedData);
      } else {
        setProducts(PRODUCTS);
      }
    } catch (err) {
      console.warn('Supabase fetch failed or table is missing, falling back to local list:', err);
      setProducts(PRODUCTS);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'homepage').single();
      if (!error && data) {
        const settings = data.settings || {};
        setSiteSettings(settings);
        setHeroTitle(settings.heroTitle || 'Temukan Teman Peluk Pertamamu');
        setHeroDescription(settings.heroDescription || 'Koleksi boneka lucu, lembut, dan berkualitas tinggi untuk menemani hari-harimu. Cocok untuk kado orang tersayang atau koleksi pribadi.');
        setHeroImage1(settings.heroImage1 || '/images/plushie_teddy.png');
        setHeroImage2(settings.heroImage2 || '/images/plushie_bunny.png');
        setHeroBadge1Icon(settings.heroBadge1Icon || '🌟');
        setHeroBadge1Text(settings.heroBadge1Text || 'Terlembut');
        setHeroBadge2Icon(settings.heroBadge2Icon || '❤️');
        setHeroBadge2Text(settings.heroBadge2Text || 'Anti Alergi');
        setLogoTextMain(settings.logoTextMain || 'Simoengil');
        setLogoTextSub(settings.logoTextSub || 'Plushie & Doll');
        setLogoIcon(settings.logoIcon || 'Smile');
        setLogoImageType(settings.logoImageType || 'icon');
        setLogoImageUrl(settings.logoImageUrl || '');
        setWhyTitle(settings.whyTitle || 'Kenapa memilih boneka Simoengil?');
        setWhyFeatures(settings.whyFeatures || [
          { icon: 'Heart', title: 'Dibuat dengan Cinta', desc: 'Setiap detail dikerjakan teliti' },
          { icon: 'ShieldCheck', title: '100% Aman', desc: 'Material hypoallergenic & SNI' },
          { icon: 'Sparkles', title: 'Bahan Premium', desc: 'Sangat lembut & tidak mudah rontok' }
        ]);
      } else {
        // No data in Supabase — silently fall through to localStorage fallback
        throw new Error('No settings in Supabase');
      }
    } catch (err) {
      console.warn('Failed to fetch site settings from Supabase, checking local storage fallback', err);
      const local = localStorage.getItem('simoengil_settings');
      if (local) {
        try {
          const settings = JSON.parse(local);
          setSiteSettings(settings);
          setHeroTitle(settings.heroTitle || 'Temukan Teman Peluk Pertamamu');
          setHeroDescription(settings.heroDescription || 'Koleksi boneka lucu, lembut, dan berkualitas tinggi untuk menemani hari-harimu. Cocok untuk kado orang tersayang atau koleksi pribadi.');
          setHeroImage1(settings.heroImage1 || '/images/plushie_teddy.png');
          setHeroImage2(settings.heroImage2 || '/images/plushie_bunny.png');
          setHeroBadge1Icon(settings.heroBadge1Icon || '🌟');
          setHeroBadge1Text(settings.heroBadge1Text || 'Terlembut');
          setHeroBadge2Icon(settings.heroBadge2Icon || '❤️');
          setHeroBadge2Text(settings.heroBadge2Text || 'Anti Alergi');
          setLogoTextMain(settings.logoTextMain || 'Simoengil');
          setLogoTextSub(settings.logoTextSub || 'Plushie & Doll');
          setLogoIcon(settings.logoIcon || 'Smile');
          setLogoImageType(settings.logoImageType || 'icon');
          setLogoImageUrl(settings.logoImageUrl || '');
          setWhyTitle(settings.whyTitle || 'Kenapa memilih boneka Simoengil?');
          setWhyFeatures(settings.whyFeatures || [
            { icon: 'Heart', title: 'Dibuat dengan Cinta', desc: 'Setiap detail dikerjakan teliti' },
            { icon: 'ShieldCheck', title: '100% Aman', desc: 'Material hypoallergenic & SNI' },
            { icon: 'Sparkles', title: 'Bahan Premium', desc: 'Sangat lembut & tidak mudah rontok' }
          ]);
          return; // Exit if local storage succeeds
        } catch (e) {
          console.warn('Failed to parse local storage settings', e);
        }
      }
      
      // Fallback defaults
      setHeroTitle('Temukan Teman Peluk Pertamamu');
      setHeroDescription('Koleksi boneka lucu, lembut, dan berkualitas tinggi untuk menemani hari-harimu. Cocok untuk kado orang tersayang atau koleksi pribadi.');
      setHeroImage1('/images/plushie_teddy.png');
      setHeroImage2('/images/plushie_bunny.png');
      setHeroBadge1Icon('🌟');
      setHeroBadge1Text('Terlembut');
      setHeroBadge2Icon('❤️');
      setHeroBadge2Text('Anti Alergi');
      setLogoTextMain('Simoengil');
      setLogoTextSub('Plushie & Doll');
      setLogoIcon('Smile');
      setLogoImageType('icon');
      setLogoImageUrl('');
      setWhyTitle('Kenapa memilih boneka Simoengil?');
      setWhyFeatures([
        { icon: 'Heart', title: 'Dibuat dengan Cinta', desc: 'Setiap detail dikerjakan teliti' },
        { icon: 'ShieldCheck', title: '100% Aman', desc: 'Material hypoallergenic & SNI' },
        { icon: 'Sparkles', title: 'Bahan Premium', desc: 'Sangat lembut & tidak mudah rontok' }
      ]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const newSettings = {
      heroTitle,
      heroDescription,
      heroImage1,
      heroImage2,
      heroBadge1Icon,
      heroBadge1Text,
      heroBadge2Icon,
      heroBadge2Text,
      logoTextMain,
      logoTextSub,
      logoIcon,
      logoImageType,
      logoImageUrl,
      whyTitle,
      whyFeatures
    };
    try {
      const { error } = await supabase.from('site_settings').upsert({
        id: 'homepage',
        settings: newSettings
      });
      if (error) throw error;
      alert('🎉 Pengaturan halaman berhasil disimpan di database!');
    } catch (err: any) {
      console.warn('Supabase saving failed for settings, performing local memory fallback:', err);
      localStorage.setItem('simoengil_settings', JSON.stringify(newSettings));
      alert(`🎉 Pengaturan berhasil disimpan secara lokal (Offline Mode)! Buka halaman utama (Toko Publik) untuk melihat perubahannya.`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Form Reset
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCategory('Boneka Beruang');
    setImageUrl('');
    setStatus('Baru');
    setDescription('');
    setFormVariants([]);
    setShopeeLink('');
    setTokopediaLink('');
    setLazadaLink('');
    setTiktokLink('');
    setShopeePrice('');
    setTokopediaPrice('');
    setLazadaPrice('');
    setTiktokPrice('');
    setShopeeAvailable(true);
    setTokopediaAvailable(true);
    setLazadaAvailable(true);
    setTiktokAvailable(true);
    setAdditionalImages([]);
    setFeatures([]);
  };

  // Add a new variant row to the subform
  const addVariantRow = () => {
    setFormVariants([
      ...formVariants,
      { size: '', price: 0, shopeePrice: undefined, tokopediaPrice: undefined, lazadaPrice: undefined, tiktokPrice: undefined, shopeeUrl: '', tokopediaUrl: '', lazadaUrl: '', tiktokUrl: '' }
    ]);
  };

  // Update a specific field in a variant row
  const handleVariantChange = (index: number, key: keyof ProductVariant, value: any) => {
    const updated = [...formVariants];
    const isNumeric = ['price', 'shopeePrice', 'tokopediaPrice', 'lazadaPrice', 'tiktokPrice'].includes(key);
    updated[index] = {
      ...updated[index],
      [key]: isNumeric ? (value === '' ? undefined : Number(value)) : value
    };
    setFormVariants(updated);
  };

  // Remove a variant row
  const removeVariantRow = (index: number) => {
    setFormVariants(formVariants.filter((_, i) => i !== index));
  };

  // Upload Image Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setter(data.url);
      } else {
        alert(data.error || 'Gagal mengunggah gambar');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  // Save / Update logic
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
      alert('Mohon isi nama, harga, dan URL gambar.');
      return;
    }

    setIsSaving(true);
    const newId = editingId || String(Date.now());
    
    // Structure data exactly as expected by typescript client
    const productData = {
      id: newId,
      name,
      price: Number(price),
      category,
      image: imageUrl,
      status,
      description,
      rating: editingId ? (products.find(p => p.id === editingId)?.rating || 5.0) : 5.0,
      reviews_count: editingId ? (products.find(p => p.id === editingId)?.reviewsCount || 0) : 0,
      shopee_link: shopeeLink || (formVariants.length > 0 ? formVariants[0].shopeeUrl : 'https://shopee.co.id'),
      tokopedia_link: tokopediaLink || (formVariants.length > 0 ? formVariants[0].tokopediaUrl : 'https://tokopedia.com'),
      shopeeAvailable,
      tokopediaAvailable,
      lazadaAvailable,
      tiktokAvailable,
      images: additionalImages,
      specifications: {
        material: '100% Premium Dacron Silikon & Kain Rasfur Halus',
        size: formVariants.length > 0 ? formVariants[0].size : 'Ukuran Standar',
        washing: 'Bisa dicuci dengan mesin (putaran lembut)',
        safeForKids: true,
        lazadaLink: lazadaLink || '',
        tiktokLink: tiktokLink || '',
        shopeePrice: shopeePrice ? Number(shopeePrice) : undefined,
        tokopediaPrice: tokopediaPrice ? Number(tokopediaPrice) : undefined,
        lazadaPrice: lazadaPrice ? Number(lazadaPrice) : undefined,
        tiktokPrice: tiktokPrice ? Number(tiktokPrice) : undefined,
        shopeeAvailable,
        tokopediaAvailable,
        lazadaAvailable,
        tiktokAvailable,
        images: additionalImages,
        features,
      },
      variants: formVariants
    };

    try {
      // Supabase Save Operation
      const { error } = await supabase.from('products').upsert({
        id: productData.id,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        image: productData.image,
        status: productData.status,
        description: productData.description,
        rating: productData.rating,
        reviews_count: productData.reviews_count,
        shopee_link: productData.shopee_link,
        tokopedia_link: productData.tokopedia_link,
        specifications: productData.specifications,
        variants: productData.variants
      });

      if (error) throw error;

      // Update local state directly on success
      const finalProduct = { 
        ...productData, 
        reviewsCount: productData.reviews_count,
        shopeeLink: productData.shopee_link,
        tokopediaLink: productData.tokopedia_link,
        lazadaLink: productData.specifications.lazadaLink,
        tiktokLink: productData.specifications.tiktokLink,
        shopeePrice: productData.specifications.shopeePrice,
        tokopediaPrice: productData.specifications.tokopediaPrice,
        lazadaPrice: productData.specifications.lazadaPrice,
        tiktokPrice: productData.specifications.tiktokPrice,
        shopeeAvailable: productData.specifications.shopeeAvailable,
        tokopediaAvailable: productData.specifications.tokopediaAvailable,
        lazadaAvailable: productData.specifications.lazadaAvailable,
        tiktokAvailable: productData.specifications.tiktokAvailable,
      };

      if (editingId) {
        setProducts(products.map(p => p.id === editingId ? finalProduct as any : p));
        alert('🎉 Produk berhasil diperbarui di database Supabase!');
      } else {
        setProducts([...products, finalProduct as any]);
        alert('🎉 Produk baru berhasil disimpan ke database Supabase!');
      }
      resetForm();
    } catch (err: any) {
      console.warn('Supabase saving failed, performing local memory fallback:', err);
      // Local fallback for preview
      const fallbackProduct = {
        ...productData,
        reviewsCount: productData.reviews_count,
        shopeeLink: productData.shopee_link,
        tokopediaLink: productData.tokopedia_link,
        lazadaLink: productData.specifications.lazadaLink,
        tiktokLink: productData.specifications.tiktokLink,
        shopeePrice: productData.specifications.shopeePrice,
        tokopediaPrice: productData.specifications.tokopediaPrice,
        lazadaPrice: productData.specifications.lazadaPrice,
        tiktokPrice: productData.specifications.tiktokPrice,
        shopeeAvailable: productData.specifications.shopeeAvailable,
        tokopediaAvailable: productData.specifications.tokopediaAvailable,
        lazadaAvailable: productData.specifications.lazadaAvailable,
        tiktokAvailable: productData.specifications.tiktokAvailable,
      };
      if (editingId) {
        setProducts(products.map(p => p.id === editingId ? fallbackProduct as any : p));
        alert(`💾 Disimpan di Memory Lokal (Supabase offline/belum setup): ${err.message}`);
      } else {
        setProducts([...products, fallbackProduct as any]);
        alert(`💾 Ditambahkan di Memory Lokal (Supabase offline/belum setup): ${err.message}`);
      }
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus boneka ini dari katalog?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
      alert('🗑️ Produk berhasil dihapus dari database Supabase!');
    } catch (err: any) {
      console.warn('Supabase delete failed, fallback to local edit:', err);
      setProducts(products.filter(p => p.id !== id));
      alert(`🗑️ Produk dihapus dari list lokal (Supabase belum tersambung).`);
    }
  };

  // Select Product for editing
  const handleEditProduct = (p: Product) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setCategory(p.category);
    setImageUrl(p.image);
    setStatus(p.status);
    setDescription(p.description);
    setFormVariants((p.variants || []).map(v => ({
      ...v,
      shopeeAvailable: v.shopeeAvailable !== undefined ? v.shopeeAvailable : true,
      tokopediaAvailable: v.tokopediaAvailable !== undefined ? v.tokopediaAvailable : true,
      lazadaAvailable: v.lazadaAvailable !== undefined ? v.lazadaAvailable : true,
      tiktokAvailable: v.tiktokAvailable !== undefined ? v.tiktokAvailable : true,
    })));
    setShopeeLink(p.shopeeLink || '');
    setTokopediaLink(p.tokopediaLink || '');
    setLazadaLink(p.lazadaLink || p.specifications?.lazadaLink || '');
    setTiktokLink(p.tiktokLink || p.specifications?.tiktokLink || '');
    setShopeePrice(p.shopeePrice ? String(p.shopeePrice) : p.specifications?.shopeePrice ? String(p.specifications.shopeePrice) : '');
    setTokopediaPrice(p.tokopediaPrice ? String(p.tokopediaPrice) : p.specifications?.tokopediaPrice ? String(p.specifications.tokopediaPrice) : '');
    setLazadaPrice(p.lazadaPrice ? String(p.lazadaPrice) : p.specifications?.lazadaPrice ? String(p.specifications.lazadaPrice) : '');
    setTiktokPrice(p.tiktokPrice ? String(p.tiktokPrice) : p.specifications?.tiktokPrice ? String(p.specifications.tiktokPrice) : '');
    setShopeeAvailable(p.shopeeAvailable !== undefined ? p.shopeeAvailable : (p.specifications?.shopeeAvailable !== undefined ? p.specifications.shopeeAvailable : true));
    setTokopediaAvailable(p.tokopediaAvailable !== undefined ? p.tokopediaAvailable : (p.specifications?.tokopediaAvailable !== undefined ? p.specifications.tokopediaAvailable : true));
    setLazadaAvailable(p.lazadaAvailable !== undefined ? p.lazadaAvailable : (p.specifications?.lazadaAvailable !== undefined ? p.specifications.lazadaAvailable : true));
    setTiktokAvailable(p.tiktokAvailable !== undefined ? p.tiktokAvailable : (p.specifications?.tiktokAvailable !== undefined ? p.specifications.tiktokAvailable : true));
    setAdditionalImages(p.specifications?.images || p.images || []);
    setFeatures(p.specifications?.features || []);
  };

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/secret-login');
  };

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Memeriksa Hak Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row">
      
      {/* MOBILE TOP NAVBAR */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100/80 flex items-center justify-center text-pink-500 font-bold text-sm shadow-sm border border-pink-200/20">🧸</div>
          <span className="font-black text-sm text-slate-800">Admin Simoengil</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Sidebar Brand header (Desktop only or shown inside sidebar) */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between lg:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100/80 flex items-center justify-center text-pink-500 font-bold text-lg shadow-sm border border-pink-200/20">
                🧸
              </div>
              <div>
                <span className="font-black text-sm text-slate-800 tracking-tight block">Simoengil</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Admin Panel</span>
              </div>
            </div>
            <button className="lg:hidden p-1 text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('katalog')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-colors border cursor-pointer ${
                activeTab === 'katalog' 
                  ? 'bg-pink-50 text-pink-600 border-pink-100/50' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Kelola Katalog</span>
            </button>
            <button
              onClick={() => setActiveTab('halaman')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-colors border cursor-pointer ${
                activeTab === 'halaman' 
                  ? 'bg-pink-50 text-pink-600 border-pink-100/50' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Pengaturan Halaman</span>
            </button>
            
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-sm font-bold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lihat Toko Publik</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">
              {activeTab === 'katalog' ? 'Kelola Katalog Boneka' : 'Pengaturan Halaman (CMS)'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              {activeTab === 'katalog' 
                ? 'Tambah, ubah, atau hapus daftar boneka dan kelola varian harga e-commerce.'
                : 'Ubah teks dan ikon yang muncul di halaman utama website.'}
            </p>
          </div>
          
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('dummy-project-id')) && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 max-w-md">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Supabase credentials belum di-setup di .env.local. Perubahan disimpan di memory lokal.</span>
            </div>
          )}
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'katalog' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* COLUMN 1: PRODUCT LIST TABLE (SPAN 7) */}
          <section className="xl:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-extrabold text-sm text-slate-700 flex items-center gap-2">
                  <List className="w-4 h-4 text-slate-500" />
                  Daftar Boneka Aktif ({products.length})
                </h3>
                {isFetching && (
                  <span className="text-[10px] text-slate-400 font-semibold animate-pulse">Menyinkronkan...</span>
                )}
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/30">
                      <th className="py-4 px-5">Boneka</th>
                      <th className="py-4 px-5">Kategori</th>
                      <th className="py-4 px-5">Harga Dasar</th>
                      <th className="py-4 px-5">Status / Varian</th>
                      <th className="py-4 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                          Tidak ada produk di database. Tambah produk pertama Anda di panel samping.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Doll Item Info */}
                          <td className="py-4 px-5 flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            </div>
                            <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-5 font-semibold text-slate-500">
                            {p.category}
                          </td>

                          {/* Base Price */}
                          <td className="py-4 px-5 font-extrabold text-slate-700">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p.price)}
                          </td>

                          {/* Status and Variants count */}
                          <td className="py-4 px-5 space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Best Seller' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                              p.status === 'Stok Terbatas' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                              p.status === 'Baru' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              'bg-blue-50 text-blue-600 border border-blue-100'
                            }`}>
                              {p.status}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {p.variants?.length || 0} ukuran varian
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="p-2 bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-500 rounded-lg transition-colors cursor-pointer"
                              title="Edit Boneka"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Boneka"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* COLUMN 2: DYNAMIC PRODUCT FORM (SPAN 5) */}
          <section className="xl:col-span-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm p-6 space-y-6">
              
              {/* Form Title */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-pink-500" />
                  {editingId ? 'Simpan Perubahan Boneka' : 'Tambah Boneka Baru'}
                </h3>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-lg transition-all"
                  >
                    <Undo className="w-3 h-3" />
                    <span>Batal Edit</span>
                  </button>
                )}
              </div>

              {/* Form inputs */}
              <form onSubmit={handleSaveProduct} className="space-y-4">
                
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Nama Boneka
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Teddy Bear Klasik Cokelat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Harga Dasar (IDR)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="89000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                        Kategori
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(!isAddingCategory);
                          setNewCategoryInput('');
                        }}
                        className="text-[10px] font-black text-pink-500 hover:text-pink-600 flex items-center gap-0.5 cursor-pointer"
                      >
                        {isAddingCategory ? 'Batal' : '+ Baru'}
                      </button>
                    </div>
                    {isAddingCategory ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Kategori baru..."
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newCategoryInput.trim();
                            if (trimmed) {
                              if (!categoriesList.includes(trimmed)) {
                                setCategoriesList([...categoriesList, trimmed]);
                              }
                              setCategory(trimmed);
                              setIsAddingCategory(false);
                            }
                          }}
                          className="px-3 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                        >
                          Tambah
                        </button>
                      </div>
                    ) : (
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Image URL & Status Tag */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Gambar Utama Produk
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="/images/plushie_teddy.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setImageUrl)}
                        className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Status Promo / Tag
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Best Seller">Best Seller</option>
                      <option value="Stok Terbatas">Stok Terbatas</option>
                      <option value="Promo">Promo</option>
                    </select>
                  </div>
                </div>

                {/* Foto Tambahan Produk */}
                <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Foto Tambahan Produk (Gallery)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdditionalImages([...additionalImages, ''])}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-pink-500 hover:text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Foto</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {additionalImages.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-3 bg-white/50 border border-dashed border-slate-200 rounded-xl">
                        Belum ada foto tambahan. Klik &quot;Tambah Foto&quot; di atas.
                      </p>
                    ) : (
                      additionalImages.map((img, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Contoh: /images/detail_fabric.png atau URL luar"
                            value={img}
                            onChange={(e) => {
                              const updated = [...additionalImages];
                              updated[idx] = e.target.value;
                              setAdditionalImages(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                          />
                          {img && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                              {/* Using HTML img tag to bypass Next.js Image component domain constraints in local preview */}
                              <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Kelebihan Produk */}
                <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Kelebihan Produk (List)
                    </span>
                    <button
                      type="button"
                      onClick={() => setFeatures([...features, ''])}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-500 hover:text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Fitur</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {features.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic text-center py-3 bg-white/50 border border-dashed border-slate-200 rounded-xl">
                        Belum ada fitur. Klik &quot;Tambah Fitur&quot; di atas.
                      </p>
                    ) : (
                      features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Contoh: Bahan Premium Rasfur"
                            value={feat}
                            onChange={(e) => {
                              const updated = [...features];
                              updated[idx] = e.target.value;
                              setFeatures(updated);
                            }}
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Fitur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Deskripsi Boneka
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tulis deskripsi detail boneka di sini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all resize-none"
                  />
                </div>

                {/* MARKETPLACE LINKS & PRICES FOR BASE PRODUCT */}
                <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Link & Harga Dasar Marketplace
                  </span>

                  {/* Availability Toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pb-2">
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1.5 rounded-lg border border-orange-100 select-none shadow-sm">
                      <input
                        type="checkbox"
                        checked={shopeeAvailable}
                        onChange={(e) => setShopeeAvailable(e.target.checked)}
                        className="accent-orange-500 rounded"
                      />
                      <span className="text-[10px] font-bold text-orange-600">Shopee</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1.5 rounded-lg border border-emerald-100 select-none shadow-sm">
                      <input
                        type="checkbox"
                        checked={tokopediaAvailable}
                        onChange={(e) => setTokopediaAvailable(e.target.checked)}
                        className="accent-emerald-500 rounded"
                      />
                      <span className="text-[10px] font-bold text-[#42b549]">Tokopedia</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1.5 rounded-lg border border-blue-100 select-none shadow-sm">
                      <input
                        type="checkbox"
                        checked={lazadaAvailable}
                        onChange={(e) => setLazadaAvailable(e.target.checked)}
                        className="accent-blue-600 rounded"
                      />
                      <span className="text-[10px] font-bold text-blue-600">Lazada</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1.5 rounded-lg border border-slate-200 select-none shadow-sm">
                      <input
                        type="checkbox"
                        checked={tiktokAvailable}
                        onChange={(e) => setTiktokAvailable(e.target.checked)}
                        className="accent-slate-800 rounded"
                      />
                      <span className="text-[10px] font-bold text-slate-800">TikTok</span>
                    </label>
                  </div>

                  {/* Shopee & Tokopedia Links */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-orange-500 block">
                        Shopee Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://shopee.co.id/..."
                        value={shopeeLink}
                        onChange={(e) => setShopeeLink(e.target.value)}
                        disabled={!shopeeAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#42b549] block">
                        Tokopedia Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://tokopedia.com/..."
                        value={tokopediaLink}
                        onChange={(e) => setTokopediaLink(e.target.value)}
                        disabled={!tokopediaAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-100 focus:border-emerald-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Lazada & TikTok Links */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-blue-900 block">
                        Lazada Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://lazada.co.id/..."
                        value={lazadaLink}
                        onChange={(e) => setLazadaLink(e.target.value)}
                        disabled={!lazadaAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-blue-100 focus:border-blue-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-800 block">
                        TikTok Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://tiktok.com/..."
                        value={tiktokLink}
                        onChange={(e) => setTiktokLink(e.target.value)}
                        disabled={!tiktokAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Shopee & Tokopedia Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-orange-500 block">
                        Harga Shopee (IDR)
                      </label>
                      <input
                        type="number"
                        placeholder="34900"
                        value={shopeePrice}
                        onChange={(e) => setShopeePrice(e.target.value)}
                        disabled={!shopeeAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-[#42b549] block">
                        Harga Tokopedia (IDR)
                      </label>
                      <input
                        type="number"
                        placeholder="29900"
                        value={tokopediaPrice}
                        onChange={(e) => setTokopediaPrice(e.target.value)}
                        disabled={!tokopediaAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-emerald-100 focus:border-emerald-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Lazada & TikTok Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-blue-900 block">
                        Harga Lazada (IDR)
                      </label>
                      <input
                        type="number"
                        placeholder="29900"
                        value={lazadaPrice}
                        onChange={(e) => setLazadaPrice(e.target.value)}
                        disabled={!lazadaAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-blue-100 focus:border-blue-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-800 block">
                        Harga TikTok (IDR)
                      </label>
                      <input
                        type="number"
                        placeholder="31900"
                        value={tiktokPrice}
                        onChange={(e) => setTiktokPrice(e.target.value)}
                        disabled={!tiktokAvailable}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC VARIANTS SECTION */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Varian Ukuran & Marketplace Link
                    </span>
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="flex items-center gap-1 text-[10px] font-extrabold text-pink-500 hover:text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Ukuran</span>
                    </button>
                  </div>

                  {/* Form fields lists for variants */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {formVariants.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center italic bg-slate-50/50 py-3 border border-dashed border-slate-200 rounded-xl">
                        Belum ada varian ukuran. Tambahkan agar pembeli dapat memilih ukuran di detail produk.
                      </p>
                    ) : (
                      formVariants.map((v, i) => (
                        <div key={i} className="bg-slate-50/60 rounded-2xl border border-slate-200/60 p-3 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(i)}
                            className="absolute top-2.5 right-2.5 p-1 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                            title="Hapus Varian"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <span className="text-[10px] font-black text-slate-400">Varian #{i + 1}</span>

                          {/* Variant Availability Checkboxes */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 py-1">
                            <label className="flex items-center gap-1 cursor-pointer bg-white px-1.5 py-1 rounded border border-orange-100 select-none shadow-sm">
                              <input
                                type="checkbox"
                                checked={v.shopeeAvailable !== false}
                                onChange={(e) => handleVariantChange(i, 'shopeeAvailable', e.target.checked)}
                                className="accent-orange-500 rounded w-3 h-3"
                              />
                              <span className="text-[9px] font-bold text-orange-600">Shopee</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer bg-white px-1.5 py-1 rounded border border-emerald-100 select-none shadow-sm">
                              <input
                                type="checkbox"
                                checked={v.tokopediaAvailable !== false}
                                onChange={(e) => handleVariantChange(i, 'tokopediaAvailable', e.target.checked)}
                                className="accent-emerald-500 rounded w-3 h-3"
                              />
                              <span className="text-[9px] font-bold text-[#42b549]">Tokopedia</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer bg-white px-1.5 py-1 rounded border border-blue-100 select-none shadow-sm">
                              <input
                                type="checkbox"
                                checked={v.lazadaAvailable !== false}
                                onChange={(e) => handleVariantChange(i, 'lazadaAvailable', e.target.checked)}
                                className="accent-blue-600 rounded w-3 h-3"
                              />
                              <span className="text-[9px] font-bold text-blue-600">Lazada</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer bg-white px-1.5 py-1 rounded border border-slate-200 select-none shadow-sm">
                              <input
                                type="checkbox"
                                checked={v.tiktokAvailable !== false}
                                onChange={(e) => handleVariantChange(i, 'tiktokAvailable', e.target.checked)}
                                className="accent-slate-800 rounded w-3 h-3"
                              />
                              <span className="text-[9px] font-bold text-slate-800">TikTok</span>
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Size Name */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400">Nama Ukuran</span>
                              <input
                                type="text"
                                required
                                placeholder="Jumbo (80cm)"
                                value={v.size}
                                onChange={(e) => handleVariantChange(i, 'size', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                              />
                            </div>
                            {/* Size Price */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400">Harga Varian (IDR)</span>
                              <input
                                type="number"
                                required
                                placeholder="150000"
                                value={v.price || ''}
                                onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Shopee Price */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-orange-500">Harga Shopee Varian</span>
                              <input
                                type="number"
                                placeholder="34900"
                                value={v.shopeePrice || ''}
                                onChange={(e) => handleVariantChange(i, 'shopeePrice', e.target.value)}
                                disabled={v.shopeeAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            {/* Tokopedia Price */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-[#42b549]">Harga Tokopedia Varian</span>
                              <input
                                type="number"
                                placeholder="29900"
                                value={v.tokopediaPrice || ''}
                                onChange={(e) => handleVariantChange(i, 'tokopediaPrice', e.target.value)}
                                disabled={v.tokopediaAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-emerald-100 focus:border-emerald-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Lazada Price */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-blue-900">Harga Lazada Varian</span>
                              <input
                                type="number"
                                placeholder="29900"
                                value={v.lazadaPrice || ''}
                                onChange={(e) => handleVariantChange(i, 'lazadaPrice', e.target.value)}
                                disabled={v.lazadaAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-blue-100 focus:border-blue-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            {/* TikTok Price */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-800">Harga TikTok Varian</span>
                              <input
                                type="number"
                                placeholder="31900"
                                value={v.tiktokPrice || ''}
                                onChange={(e) => handleVariantChange(i, 'tiktokPrice', e.target.value)}
                                disabled={v.tiktokAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Shopee URL */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-orange-500">Shopee Link Varian</span>
                              <input
                                type="text"
                                placeholder="https://shopee.co.id/..."
                                value={v.shopeeUrl}
                                onChange={(e) => handleVariantChange(i, 'shopeeUrl', e.target.value)}
                                disabled={v.shopeeAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-orange-100 focus:border-orange-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            {/* Tokopedia URL */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-[#42b549]">Tokopedia Link Varian</span>
                              <input
                                type="text"
                                placeholder="https://tokopedia.com/..."
                                value={v.tokopediaUrl}
                                onChange={(e) => handleVariantChange(i, 'tokopediaUrl', e.target.value)}
                                disabled={v.tokopediaAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-emerald-100 focus:border-emerald-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Lazada URL */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-blue-900">Lazada Link Varian</span>
                              <input
                                type="text"
                                placeholder="https://lazada.co.id/..."
                                value={v.lazadaUrl || ''}
                                onChange={(e) => handleVariantChange(i, 'lazadaUrl', e.target.value)}
                                disabled={v.lazadaAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-blue-100 focus:border-blue-300 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                            {/* TikTok URL */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-800">TikTok Link Varian</span>
                              <input
                                type="text"
                                placeholder="https://tiktok.com/..."
                                value={v.tiktokUrl || ''}
                                onChange={(e) => handleVariantChange(i, 'tiktokUrl', e.target.value)}
                                disabled={v.tiktokAvailable === false}
                                className="w-full px-2 py-1 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-[10px] font-medium text-slate-800 disabled:opacity-40 disabled:bg-slate-100 disabled:cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-pink-400 hover:bg-pink-500 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-pink-500/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan Produk...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingId ? 'Simpan Perubahan' : 'Tambah Boneka ke Katalog'}</span>
                    </>
                  )}
                </button>
              </form>

            </div>
          </section>

        </div>
        ) : (
          <div className="max-w-3xl space-y-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Pengaturan Teks & Ikon Halaman Utama
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Logo Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Logo & Identitas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Teks Logo Utama</label>
                      <input type="text" value={logoTextMain} onChange={(e) => setLogoTextMain(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Teks Slogan (Kecil)</label>
                      <input type="text" value={logoTextSub} onChange={(e) => setLogoTextSub(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Tipe Logo Visual</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input type="radio" value="icon" checked={logoImageType === 'icon'} onChange={(e) => setLogoImageType(e.target.value)} className="text-pink-500 focus:ring-pink-400" />
                        Gunakan Ikon Bawaan
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input type="radio" value="image" checked={logoImageType === 'image'} onChange={(e) => setLogoImageType(e.target.value)} className="text-pink-500 focus:ring-pink-400" />
                        Gunakan Gambar Sendiri
                      </label>
                    </div>
                  </div>
                  {logoImageType === 'icon' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nama Ikon (Lucide)</label>
                      <input type="text" value={logoIcon} onChange={(e) => setLogoIcon(e.target.value)} className="w-full md:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" placeholder="Contoh: Smile" />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Gambar Logo</label>
                      <div className="flex flex-col xl:flex-row gap-2">
                        <input type="text" value={logoImageUrl} onChange={(e) => setLogoImageUrl(e.target.value)} className="w-full xl:w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" placeholder="/images/my-logo.png" />
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoImageUrl)} className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Hero Section */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Bagian Utama (Hero)</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Judul Utama</label>
                    <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Deskripsi Utama</label>
                    <textarea rows={3} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100 resize-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Gambar Hero Utama</label>
                      <div className="flex flex-col gap-2">
                        <input type="text" value={heroImage1} onChange={(e) => setHeroImage1(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setHeroImage1)} className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Gambar Hero Kecil</label>
                      <div className="flex flex-col gap-2">
                        <input type="text" value={heroImage2} onChange={(e) => setHeroImage2(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setHeroImage2)} className="text-[10px] file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Badge 1 (Ikon & Teks)</label>
                      <div className="flex gap-2">
                        <input type="text" value={heroBadge1Icon} onChange={(e) => setHeroBadge1Icon(e.target.value)} className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100 text-center" />
                        <input type="text" value={heroBadge1Text} onChange={(e) => setHeroBadge1Text(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Badge 2 (Ikon & Teks)</label>
                      <div className="flex gap-2">
                        <input type="text" value={heroBadge2Icon} onChange={(e) => setHeroBadge2Icon(e.target.value)} className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100 text-center" />
                        <input type="text" value={heroBadge2Text} onChange={(e) => setHeroBadge2Text(e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Section */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Bagian &quot;Kenapa Memilih Kami&quot;</h4>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Judul Bagian</label>
                    <input type="text" value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-pink-400 focus:ring-1 focus:ring-pink-100" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Daftar Keunggulan (Ikon & Teks)</label>
                    {whyFeatures.map((feat, i) => (
                      <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                        <button type="button" onClick={() => setWhyFeatures(whyFeatures.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5"/></button>
                        <div className="w-full sm:w-1/4">
                          <span className="text-[9px] font-bold text-slate-400 mb-1 block">Nama Ikon (Lucide)</span>
                          <input type="text" value={feat.icon} onChange={(e) => { const newF = [...whyFeatures]; newF[i].icon = e.target.value; setWhyFeatures(newF); }} className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-100" placeholder="Contoh: Heart" />
                        </div>
                        <div className="w-full sm:w-1/3">
                          <span className="text-[9px] font-bold text-slate-400 mb-1 block">Judul</span>
                          <input type="text" value={feat.title} onChange={(e) => { const newF = [...whyFeatures]; newF[i].title = e.target.value; setWhyFeatures(newF); }} className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-100" placeholder="Contoh: 100% Aman" />
                        </div>
                        <div className="w-full sm:flex-1">
                          <span className="text-[9px] font-bold text-slate-400 mb-1 block">Deskripsi Singkat</span>
                          <input type="text" value={feat.desc} onChange={(e) => { const newF = [...whyFeatures]; newF[i].desc = e.target.value; setWhyFeatures(newF); }} className="w-full px-2 py-1.5 text-[10px] rounded-lg border border-slate-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-100" placeholder="Contoh: Sangat lembut..." />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setWhyFeatures([...whyFeatures, { icon: 'Star', title: '', desc: '' }])} className="text-[10px] font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1"><Plus className="w-3 h-3"/> Tambah Keunggulan</button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                  <button type="submit" disabled={isSavingSettings} className="w-full sm:w-auto px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    {isSavingSettings ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Simpan Pengaturan
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
