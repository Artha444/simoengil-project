export interface ShopeeProductData {
  name: string | null;
  price: number | null;
  rating: number | null;
  reviewsCount: number | null;
  soldCount: number | null;
  available: boolean;
  image: string | null;
}

interface JsonLdProduct {
  '@type'?: string;
  name?: string;
  image?: string | string[];
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
  aggregateRating?: {
    ratingValue?: string;
    reviewCount?: string;
  };
}

interface ProductDetailResponse {
  item?: {
    name?: string;
    price_min?: number;
    price_max?: number;
    item_rating?: {
      rating_star?: number;
      rating_count?: number[];
    };
    historical_sold?: number;
    images?: string[];
    stock?: number;
  };
  data?: {
    item?: {
      name?: string;
      price_min?: number;
      price_max?: number;
      item_rating?: {
        rating_star?: number;
        rating_count?: number[];
      };
      historical_sold?: number;
      images?: string[];
      stock?: number;
    };
  };
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
  'Referer': 'https://shopee.co.id/',
};

const API_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
  'Referer': 'https://shopee.co.id/',
  'x-requested-with': 'XMLHttpRequest',
  'Origin': 'https://shopee.co.id',
};

function parseShopeeUrl(url: string): { shopId: string; itemId: string; nameFromSlug: string | null } | null {
  const match = url.match(/i\.(\d+)\.(\d+)/);
  if (!match) return null;

  let nameFromSlug: string | null = null;
  try {
    const pathMatch = url.match(/shopee\.co\.id\/(.+?)-i\./);
    if (pathMatch) {
      nameFromSlug = pathMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  } catch {
    // ignore
  }

  return { shopId: match[1], itemId: match[2], nameFromSlug };
}

function extractJsonLd(html: string): JsonLdProduct | null {
  const regex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed['@type'] === 'Product' || parsed['@type'] === 'product') {
        return parsed as JsonLdProduct;
      }
    } catch {
      // continue
    }
  }
  return null;
}

function parseFromJsonLd(jsonLd: JsonLdProduct): Partial<ShopeeProductData> {
  const result: Partial<ShopeeProductData> = {};

  if (jsonLd.name) result.name = jsonLd.name;
  if (jsonLd.offers?.price) result.price = parseInt(jsonLd.offers.price, 10) || null;
  if (jsonLd.offers?.availability) {
    result.available = jsonLd.offers.availability.includes('InStock');
  }
  if (jsonLd.aggregateRating?.ratingValue) {
    result.rating = parseFloat(jsonLd.aggregateRating.ratingValue) || null;
  }
  if (jsonLd.aggregateRating?.reviewCount) {
    result.reviewsCount = parseInt(jsonLd.aggregateRating.reviewCount, 10) || null;
  }
  if (jsonLd.image) {
    result.image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
  }

  return result;
}

function mapFromApi(item: NonNullable<ProductDetailResponse['item']>): ShopeeProductData {
  const ratingCounts = item.item_rating?.rating_count || [];
  const totalReviews = ratingCounts.reduce((a, b) => a + b, 0);

  let image: string | null = null;
  if (item.images && item.images.length > 0) {
    image = `https://down-id.img.susercontent.com/file/${item.images[0]}`;
  }

  return {
    name: item.name || null,
    price: item.price_min || null,
    rating: item.item_rating?.rating_star || null,
    reviewsCount: totalReviews || null,
    soldCount: item.historical_sold || 0,
    available: (item.stock ?? 0) > 0,
    image,
  };
}

async function scraperApiFetch(url: string, apiKey: string): Promise<Response> {
  const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&country_code=id`;
  return fetch(proxyUrl);
}

async function scraperApiFetchWithHeaders(url: string, apiKey: string, headers: Record<string, string>): Promise<Response> {
  const headerParams = Object.entries(headers)
    .map(([key, val]) => `&header_${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join('');
  const proxyUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}&country_code=id${headerParams}`;
  return fetch(proxyUrl);
}

export async function fetchShopeeProductData(shopeeUrl: string): Promise<{ data?: ShopeeProductData; errors: string[]; partial?: boolean }> {
  const ids = parseShopeeUrl(shopeeUrl);
  if (!ids) return { errors: ['URL tidak mengandung pola shop_id/item_id'] };

  const errors: string[] = [];
  const apiKey = process.env.SCRAPER_API_KEY;

  // Try 1: ScraperAPI — fetch product page HTML & parse JSON-LD
  if (apiKey) {
    try {
      const response = await scraperApiFetchWithHeaders(shopeeUrl, apiKey, BROWSER_HEADERS);
      if (response.ok) {
        const html = await response.text();
        const jsonLd = extractJsonLd(html);
        if (jsonLd) {
          const parsed = parseFromJsonLd(jsonLd);
          return { errors: [], data: {
            name: parsed.name ?? null,
            price: parsed.price ?? null,
            rating: parsed.rating ?? null,
            reviewsCount: parsed.reviewsCount ?? null,
            soldCount: null,
            available: parsed.available ?? true,
            image: parsed.image ?? null,
          }};
        }
        errors.push('HTML page OK, but no JSON-LD found');
      } else {
        errors.push(`HTML page: HTTP ${response.status}`);
      }
    } catch (e: any) {
      errors.push(`HTML page: ${e.message}`);
    }
  } else {
    errors.push('SCRAPER_API_KEY not set in .env.local');
  }

  // Try 2: ScraperAPI — proxy to Shopee API v2 with browser headers
  if (apiKey) {
    try {
      const apiUrl = `https://shopee.co.id/api/v2/item/get?itemid=${ids.itemId}&shopid=${ids.shopId}`;
      const response = await scraperApiFetchWithHeaders(apiUrl, apiKey, API_HEADERS);
      if (response.ok) {
        const text = await response.text();
        try {
          const data: ProductDetailResponse = JSON.parse(text);
          const item = data?.item;
          if (item) {
            return { errors: [], data: mapFromApi(item) };
          }
          errors.push('v2/item: empty response data');
        } catch {
          errors.push('v2/item: Invalid JSON response');
        }
      } else {
        errors.push(`v2/item: HTTP ${response.status}`);
      }
    } catch (e: any) {
      errors.push(`v2/item: ${e.message}`);
    }
  }

  // Try 3: Direct API call from server
  try {
    const apiUrl = `https://shopee.co.id/api/v2/item/get?itemid=${ids.itemId}&shopid=${ids.shopId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': BROWSER_HEADERS['User-Agent'],
        'Referer': 'https://shopee.co.id/',
        'Accept': 'application/json',
      },
    });
    if (response.ok) {
      const data: ProductDetailResponse = await response.json();
      if (data?.item) {
        return { errors: [], data: mapFromApi(data.item) };
      }
    }
    errors.push(`Direct: HTTP ${response.status}`);
  } catch (e: any) {
    errors.push(`Direct: ${e.message}`);
  }

  // All fetches failed. Return partial data from URL parsing.
  console.warn('[shopee-scraper] All methods failed:', errors.join('; '));
  return {
    errors,
    partial: true,
    data: {
      name: ids.nameFromSlug ?? null,
      price: null,
      rating: null,
      reviewsCount: null,
      soldCount: null,
      available: true,
      image: null,
    },
  };
}
