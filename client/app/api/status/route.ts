import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'E-commerce app is running',
    timestamp: new Date().toISOString()
  });
}