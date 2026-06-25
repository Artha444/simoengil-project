import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FK_ERROR = '23503';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function isColumnError(error: any, column: string) {
  return error?.message?.toLowerCase()?.includes('column') &&
    error?.message?.toLowerCase()?.includes(column.toLowerCase());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sender_role, content, product_id, user_id, user_name } = body;

    if (!content || !sender_role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    const insertData: any = {
      sender_role,
      content,
    };

    if (product_id !== undefined && product_id !== null) insertData.product_id = product_id;
    if (user_id) insertData.user_id = user_id;
    if (user_name) insertData.user_name = user_name;

    let { data, error } = await supabaseAdmin.from('messages').insert(insertData).select().single();

    if (error) {
      const code = error.code;
      const msg = error.message || '';

      // FK violation on product_id — retry without it
      if (code === FK_ERROR && msg.includes('product_id')) {
        delete insertData.product_id;
        const retry = await supabaseAdmin.from('messages').insert(insertData).select().single();
        if (retry.error) throw retry.error;
        data = retry.data;
      }
      // Missing user_id column — retry without user_id/user_name
      else if (isColumnError(error, 'user_id')) {
        delete insertData.user_id;
        delete insertData.user_name;
        const retry = await supabaseAdmin.from('messages').insert(insertData).select().single();
        if (retry.error) throw retry.error;
        data = retry.data;
      } else {
        throw error;
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error inserting message:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const productId = searchParams.get('product_id');

    const supabaseAdmin = getAdminClient();

    if (action === 'conversations') {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .not('product_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, any>();
      for (const msg of data || []) {
        const pid = msg.product_id;
        if (!conversationMap.has(pid)) {
          conversationMap.set(pid, {
            user_id: pid,
            user_name: msg.user_name || 'User',
            last_message: msg.content,
            last_message_at: msg.created_at,
            last_sender: msg.sender_role,
            unread: 0,
          });
        } else {
          const conv = conversationMap.get(pid);
          if (msg.sender_role === 'USER') {
            conv.unread++;
          }
        }
      }

      return NextResponse.json({ success: true, data: Array.from(conversationMap.values()) });
    }

    if (productId) {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('product_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, product_id } = body;

    if (action === 'mark_read' && product_id) {
      const supabaseAdmin = getAdminClient();
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('product_id', product_id)
        .eq('sender_role', 'USER')
        .eq('is_read', false);

      if (error) {
        if (isColumnError(error, 'is_read')) {
          return NextResponse.json({ success: true, warning: 'is_read column not found' });
        }
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

