import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
}
