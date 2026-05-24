import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { status: 'error', message: 'Nomor Resi / Order ID tidak ditemukan.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { status: 'error', message: 'Kredensial database server belum dikonfigurasi.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { status: 'error', message: 'Pesanan tidak ditemukan. Periksa kembali Nomor Order Anda.' },
        { status: 404 }
      );
    }

    // Mock tracking timeline based on the order's created_at date
    const createdAt = new Date(order.created_at);
    const now = new Date();
    
    // Simulate hours passed to determine status
    const hoursPassed = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;

    let courierStatus = 'PENDING';
    let courierNotes = 'Menunggu Konfirmasi Pembayaran';
    
    // Simulation logic based on order status or time passed
    if (order.status === 'PENDING') {
      courierStatus = 'PENDING';
      courierNotes = 'Menunggu pembayaran diselesaikan oleh pembeli.';
    } else {
      if (hoursPassed < 2) {
        courierStatus = 'PROCESSING';
        courierNotes = 'Pesanan sedang dikemas oleh penjual.';
      } else if (hoursPassed < 12) {
        courierStatus = 'SHIPPED';
        courierNotes = 'Paket telah diserahkan ke pihak kurir dan dalam perjalanan menuju fasilitas sortir.';
      } else if (hoursPassed < 24) {
        courierStatus = 'SHIPPED';
        courierNotes = `Paket sedang di perjalanan menuju ${order.shipping_address?.city || 'kota tujuan'}.`;
      } else {
        courierStatus = 'DELIVERED';
        courierNotes = 'Paket telah sampai di tujuan pengiriman.';
      }
    }

    // Generate dummy history
    const history = [];
    history.push({
      date: createdAt.toISOString(),
      status: 'Pesanan Dibuat',
      description: 'Pesanan Anda telah diterima oleh sistem.'
    });

    if (order.status !== 'PENDING') {
      const paidTime = new Date(createdAt.getTime() + 5 * 60000); // 5 mins later
      history.push({
        date: paidTime.toISOString(),
        status: 'Pembayaran Dikonfirmasi',
        description: 'Pembayaran telah berhasil diverifikasi.'
      });

      if (hoursPassed >= 2) {
        const packTime = new Date(createdAt.getTime() + 2 * 36e5);
        history.push({
          date: packTime.toISOString(),
          status: 'Diproses Penjual',
          description: 'Penjual sedang mengemas paket Anda.'
        });
      }

      if (hoursPassed >= 12) {
        const shipTime = new Date(createdAt.getTime() + 12 * 36e5);
        history.push({
          date: shipTime.toISOString(),
          status: 'Diserahkan ke Kurir',
          description: `Paket telah diserahkan ke pihak kurir ${order.courier?.name || ''}.`
        });
      }
      
      if (hoursPassed >= 24) {
        const deliverTime = new Date(createdAt.getTime() + 24 * 36e5);
        history.push({
          date: deliverTime.toISOString(),
          status: 'Paket Terkirim',
          description: `Paket telah diterima di alamat tujuan.`
        });
      }
    }

    const trackingData = {
      orderId: order.id,
      status: order.status,
      courier: order.courier,
      shippingAddress: order.shipping_address,
      trackingStatus: courierStatus,
      trackingNotes: courierNotes,
      history: history.reverse() // Newest first
    };

    return NextResponse.json({
      status: 'success',
      data: trackingData
    });

  } catch (error: any) {
    console.error('Tracking API Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Terjadi kesalahan sistem.' },
      { status: 500 }
    );
  }
}
