import { fetchShopeeProductData } from '@/lib/shopee-scraper';

export async function POST(request: Request) {
  try {
    const { shopeeUrl } = await request.json();

    if (!shopeeUrl || typeof shopeeUrl !== 'string') {
      return Response.json(
        { success: false, error: 'URL Shopee tidak valid' },
        { status: 400 }
      );
    }

    if (!shopeeUrl.includes('shopee.co.id')) {
      return Response.json(
        { success: false, error: 'Harus URL Shopee Indonesia (shopee.co.id)' },
        { status: 400 }
      );
    }

    const result = await fetchShopeeProductData(shopeeUrl);

    if (!result.data) {
      return Response.json({
        success: false,
        error: 'Gagal memproses URL Shopee.',
        errors: result.errors,
      });
    }

    return Response.json({
      success: true,
      data: result.data,
      partial: result.partial || false,
      errors: result.errors,
    });
  } catch (err: any) {
    console.error('[shopee-scraper API] Error:', err);
    return Response.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
