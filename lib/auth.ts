// Simple API key authentication
// Extensible to DB-backed keys in production

export const validateApiKey = (apiKey: string | null | undefined): boolean => {
  const expectedKey = process.env.API_KEY
  if (!expectedKey) {
    throw new Error('API_KEY not configured')
  }
  return apiKey === expectedKey
}

export const getApiKeyFromRequest = (headers: Headers): string | null => {
  // Check Authorization header: Bearer <key> or X-API-Key
  const authHeader = headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  const apiKeyHeader = headers.get('x-api-key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }
  
  return null
}

