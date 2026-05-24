import { NextRequest, NextResponse } from 'next/server';
import { calculateCost } from '@/lib/biteship';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originId, destinationId, weight } = body;

    if (!destinationId || !weight) {
      return NextResponse.json(
        { status: 'error', message: 'Parameters destinationId and weight are required' },
        { status: 400 }
      );
    }

    // Default origin destination_id if not provided (Biteship requires an origin area ID)
    // You should set this in your .env.local to the biteship area ID of your warehouse
    // Defaulting to "IDNP11IDNC63IDND4095IDZ12110" which is roughly Kebayoran Baru for dummy fallback
    const shipperId = originId || process.env.BITESHIP_SHIPPER_ID || 'IDNP11IDNC63IDND4095IDZ12110'; 

    const costDetails = await calculateCost(shipperId, destinationId, Number(weight));
    return NextResponse.json({ status: 'success', data: costDetails });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}
