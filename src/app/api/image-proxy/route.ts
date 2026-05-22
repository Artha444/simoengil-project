import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Image Proxy
 * Proxies external images (e.g., from Tokopedia/Shopee CDN) to avoid hotlinking blocks.
 * Usage: /api/image-proxy?url=https://images.tokopedia.net/...
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing "url" parameter' }, { status: 400 });
  }

  // Handle potential double-encoding
  try {
    // If the URL still contains %xx patterns after searchParams decoding, decode again
    if (imageUrl.includes('%3A') || imageUrl.includes('%2F')) {
      imageUrl = decodeURIComponent(imageUrl);
    }
  } catch {
    // ignore decode errors
  }

  // Validate it's a proper URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Allow any e-commerce CDN domain (Tokopedia, Shopee, Lazada, etc.)
  const hostname = parsedUrl.hostname.toLowerCase();
  const allowedPatterns = [
    'tokopedia',
    'susercontent.com',
    'shopee',
    'lazada',
    'tiktok',
    'supabase.co',
    'unsplash.com',
  ];

  const isAllowed = allowedPatterns.some((pattern) => hostname.includes(pattern));

  if (!isAllowed) {
    console.warn(`[image-proxy] Blocked domain: ${hostname}`);
    return NextResponse.json({ error: `Domain not allowed: ${hostname}` }, { status: 403 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': hostname.includes('tokopedia')
          ? 'https://www.tokopedia.com/'
          : hostname.includes('shopee')
          ? 'https://shopee.co.id/'
          : 'https://www.google.com/',
      },
    });

    if (!response.ok) {
      // If CDN returns error (e.g., expired signature), return a transparent placeholder
      console.warn(`[image-proxy] CDN returned ${response.status} for: ${imageUrl.substring(0, 100)}...`);
      
      // Return a 1x1 transparent PNG as fallback so the page doesn't break
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      return new NextResponse(transparentPng, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[image-proxy] Fetch error:', err);
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 });
  }
}
