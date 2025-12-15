import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*'
  
  // Create response with CORS headers
  const response = NextResponse.next()
  
  // Set CORS headers for all API routes
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Max-Age', '86400')
  response.headers.set('Access-Control-Allow-Credentials', 'false')
  
  // Handle preflight OPTIONS requests - return early with CORS headers
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
      },
    })
  }
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}

