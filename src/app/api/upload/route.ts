import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase admin client to bypass RLS for server-side uploads
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${uniqueSuffix}-${originalName}`;
    
    // Try to upload to Supabase Storage in a bucket named "images" bypassing RLS
    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage Error:', error);
      
      // Detailed error for user
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: 'Bucket "images" belum dibuat di Supabase Storage Anda. Silakan buat bucket bernama "images" (dan set public) di dashboard Supabase.' 
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(filename);
      
    if (!publicUrlData.publicUrl) {
      return NextResponse.json({ error: 'Gagal mendapatkan URL publik gambar.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlData.publicUrl, success: true });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
