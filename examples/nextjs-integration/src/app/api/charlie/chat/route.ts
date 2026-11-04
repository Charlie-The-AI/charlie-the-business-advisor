import { NextResponse } from 'next/server';
import { Charlie } from 'charlie-the-business-advisor';

const charlie = new Charlie({ defaultCurrency: 'NGN' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { question, history = [], orders, analytics } = body;

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'A question string is required.' },
        { status: 400 }
      );
    }

    const result = await charlie.chat({
      question,
      history,
      orders,
      analytics,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Advisory chat failed' },
      { status: 400 }
    );
  }
}
