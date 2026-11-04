import { NextResponse } from 'next/server';
import { Charlie } from 'charlie-the-business-advisor';

const charlie = new Charlie({ defaultCurrency: 'NGN' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orders, customers, analytics, objective, category } = body;

    const result = await charlie.advise({
      orders,
      customers,
      analytics,
      objective,
      category,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Advisory generation failed' },
      { status: 400 }
    );
  }
}
