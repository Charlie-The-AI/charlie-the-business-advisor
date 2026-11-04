import { NextResponse } from 'next/server';
import { Charlie } from 'charlie-the-business-advisor';

const charlie = new Charlie({ defaultCurrency: 'NGN' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orders = [], customers = [], currency = 'NGN' } = body;

    const snapshot = charlie.analyze({
      orders,
      customers,
      currency,
    });

    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Analytics calculation failed' },
      { status: 400 }
    );
  }
}
