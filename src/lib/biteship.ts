export interface BiteshipDestination {
  id: string;
  label: string;
}

export interface ShippingCostOption {
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface CourierResult {
  code: string;
  name: string;
  costs: ShippingCostOption[];
}

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY || '';
const BITESHIP_BASE_URL = 'https://api.biteship.com/v1';

export async function searchDestination(keyword: string): Promise<BiteshipDestination[]> {
  if (!BITESHIP_API_KEY || !keyword || keyword.length < 3) {
    if (keyword.length >= 3) {
       console.warn('API Key is missing. Returning mock areas.');
       return generateMockAreas(keyword);
    }
    return [];
  }

  try {
    const res = await fetch(`${BITESHIP_BASE_URL}/maps/areas?countries=ID&input=${encodeURIComponent(keyword)}&type=single`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Biteship API responded with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to search destination');
    }

    const results = json.areas || [];
    return results.map((item: any) => ({
      id: item.id,
      label: item.name
    }));
  } catch (error) {
    console.error('Error searching destination from Biteship:', error);
    return generateMockAreas(keyword);
  }
}

export async function calculateCost(
  originId: string, 
  destinationId: string, 
  weight: number, // in grams
): Promise<CourierResult[]> {
  if (!BITESHIP_API_KEY || !originId || !destinationId) {
    console.warn('API Key or Location IDs are missing. Returning mock shipping costs.');
    return generateMockCosts();
  }

  try {
    const res = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BITESHIP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin_area_id: originId,
        destination_area_id: destinationId,
        couriers: "jne,sicepat,jnt,ninja,anteraja",
        items: [
          {
            name: "Boneka Simoengil",
            description: "Boneka",
            value: 100000,
            weight: weight,
            quantity: 1
          }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Biteship API responded with status ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Failed to calculate cost');
    }
    
    // Biteship groups by pricing list, we should group by courier_code
    const couriersMap = new Map<string, CourierResult>();

    const pricings = json.pricing || [];
    
    for (const pricing of pricings) {
      const code = pricing.courier_code.toLowerCase();
      const name = pricing.courier_name;
      
      if (!couriersMap.has(code)) {
        couriersMap.set(code, {
          code,
          name,
          costs: []
        });
      }

      const courierResult = couriersMap.get(code)!;
      
      courierResult.costs.push({
        service: pricing.courier_service_code.toUpperCase(),
        description: pricing.description || pricing.courier_service_name,
        cost: pricing.price,
        etd: pricing.duration || '-'
      });
    }

    return Array.from(couriersMap.values());
  } catch (error) {
    console.error(`Error calculating cost from Biteship:`, error);
    return generateMockCosts();
  }
}

function generateMockAreas(keyword: string): BiteshipDestination[] {
  return [
    { id: 'mock_1', label: `${keyword}, Jakarta Selatan, DKI Jakarta` },
    { id: 'mock_2', label: `${keyword}, Bandung, Jawa Barat` }
  ];
}

function generateMockCosts(): CourierResult[] {
  return [
    {
      code: 'jne',
      name: 'JNE',
      costs: [
        { service: 'REG', description: 'Layanan Reguler JNE', cost: 15000, etd: '2-3 Hari' },
        { service: 'YES', description: 'Yakin Esok Sampai', cost: 25000, etd: '1 Hari' }
      ]
    },
    {
      code: 'sicepat',
      name: 'SiCepat Ekspres',
      costs: [
        { service: 'REG', description: 'SiCepat Reguler', cost: 14000, etd: '1-2 Hari' },
        { service: 'BEST', description: 'Besok Sampai Tujuan', cost: 24000, etd: '1 Hari' }
      ]
    },
    {
      code: 'jnt',
      name: 'J&T Express',
      costs: [
        { service: 'EZ', description: 'Layanan Reguler', cost: 16000, etd: '2-3 Hari' }
      ]
    }
  ];
}
