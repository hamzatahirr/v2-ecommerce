import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'GraphQL service temporarily unavailable',
    status: 'fallback_mode',
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({
    errors: [{
      message: 'GraphQL service temporarily unavailable. Please try again later.',
      extensions: {
        code: 'SERVICE_UNAVAILABLE'
      }
    }],
    data: null,
  }, { status: 503 });
}