import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware runs on Edge runtime by default in Next.js 14
export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*'
  const pathname = request.nextUrl.pathname
  
  // Handle preflight OPTIONS requests FIRST - return early with CORS headers
  if (request.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS preflight for ${pathname} from origin: ${origin}`)
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false',
        'Vary': 'Origin',
        // CRITICAL: Prevent caching of OPTIONS responses - Vercel was caching and returning 304
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  }
  
  // For all other requests, add CORS headers
  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Max-Age', '86400')
  response.headers.set('Access-Control-Allow-Credentials', 'false')
  response.headers.set('Vary', 'Origin')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}

