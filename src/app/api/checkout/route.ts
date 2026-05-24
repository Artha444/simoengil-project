import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Load midtrans-client dynamically to bypass type checking and commonJS compilation warnings in Next.js
const midtransClient = require('midtrans-client');

export async function POST(request: NextRequest) {
  try {
    // 1. Get Auth Header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', message: 'Token otentikasi tidak ditemukan.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // 2. Initialize Supabase Clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { status: 'error', message: 'Kredensial database server belum dikonfigurasi.' },
        { status: 500 }
      );
    }

    // Client for user verification (using client token)
    const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { status: 'error', message: 'Sesi login tidak valid atau telah kadaluarsa.' },
        { status: 401 }
      );
    }

    // 3. Parse Body
    const body = await request.json();
    const { items, shippingAddress, courier, totalPrice } = body;

    if (!items || !shippingAddress || !courier || !totalPrice) {
      return NextResponse.json(
        { status: 'error', message: 'Data pesanan tidak lengkap.' },
        { status: 400 }
      );
    }

    // Client for database operations (using service_role to insert securely)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 4. Insert Order to Database
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        shipping_address: shippingAddress,
        courier: courier,
        items: items,
        total_price: Number(totalPrice),
        status: 'PENDING'
      })
      .select()
      .single();

    if (dbError || !order) {
      console.error('Database Error inserting order:', dbError);
      return NextResponse.json(
        { status: 'error', message: `Gagal menyimpan pesanan: ${dbError?.message}` },
        { status: 500 }
      );
    }

    // 4.5. Link Chat Session if provided
    const { sessionId } = body;
    if (sessionId) {
      await supabaseAdmin
        .from('messages')
        .update({ product_id: order.id })
        .eq('product_id', sessionId);
    }

    // 5. Initialize Midtrans Snap SDK
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
    const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

    if (!midtransServerKey || !midtransClientKey) {
      console.warn('Midtrans credentials missing. Simulating checkout without Midtrans token.');
      // Return simulation response
      return NextResponse.json({
        status: 'success',
        data: {
          isSimulation: true,
          orderId: order.id,
          token: 'MOCK-TOKEN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
        }
      });
    }

    const snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: midtransServerKey,
      clientKey: midtransClientKey
    });

    // 6. Create Midtrans snap parameter
    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Number(totalPrice)
      },
      credit_card: {
        secure: true
      },
      customer_details: {
        first_name: shippingAddress.name || user.user_metadata?.full_name || 'Pelanggan Simoengil',
        email: user.email,
        phone: shippingAddress.phone || '',
        billing_address: {
          first_name: shippingAddress.name || user.user_metadata?.full_name || 'Pelanggan Simoengil',
          phone: shippingAddress.phone || '',
          address: shippingAddress.detailAddress,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: shippingAddress.name || user.user_metadata?.full_name || 'Pelanggan Simoengil',
          phone: shippingAddress.phone || '',
          address: shippingAddress.detailAddress,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country_code: 'IDN'
        }
      },
      item_details: [
        ...items.map((item: any) => ({
          id: item.id || 'item',
          price: Number(item.price),
          quantity: Number(item.quantity || 1),
          name: item.name.substring(0, 50)
        })),
        {
          id: 'shipping_fee',
          price: Number(courier.cost),
          quantity: 1,
          name: `Ongkir ${courier.name} (${courier.service})`.substring(0, 50)
        }
      ]
    };

    // 7. Request snap token
    const transaction = await snap.createTransaction(parameter);
    const snapToken = transaction.token;

    // 8. Update database with snap token and redirect URL
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        midtrans_token: snapToken,
        midtrans_transaction_id: transaction.redirect_url
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with Midtrans token:', updateError);
    }

    return NextResponse.json({
      status: 'success',
      data: {
        orderId: order.id,
        token: snapToken,
        redirectUrl: transaction.redirect_url
      }
    });

  } catch (error: any) {
    console.error('Error in API Checkout Route:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan sistem saat memproses checkout.' },
      { status: 500 }
    );
  }
}
