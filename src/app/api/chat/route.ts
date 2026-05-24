import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender_role, content, product_id } = body;

    if (!content || !product_id || !sender_role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await supabaseAdmin.from('messages').insert({
      sender_role,
      content,
      product_id
    }).select().single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error inserting message:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
