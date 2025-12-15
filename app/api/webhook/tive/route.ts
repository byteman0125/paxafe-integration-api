import { NextRequest, NextResponse } from 'next/server'
import { getTiveSchema } from '@/lib/validation'
import { transformToSensor, transformToLocation } from '@/lib/transform'
import { validateApiKey, getApiKeyFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
  response.headers.set('Access-Control-Max-Age', '86400')
  response.headers.set('Access-Control-Allow-Credentials', 'false')
  return response
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    }
  })
  return response
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const apiKey = getApiKeyFromRequest(request.headers)
    if (!validateApiKey(apiKey)) {
      const response = NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      )
      return addCorsHeaders(response)
    }

    // Parse and validate payload
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      const response = NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON payload' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    const schema = getTiveSchema()
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      const response = NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Payload does not match Tive schema',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    const payload = validationResult.data

    // Transform to PAXAFE formats
    const sensorData = transformToSensor(payload)
    const locationData = transformToLocation(payload)

    // Store in database (transaction for atomicity)
    const result = await prisma.$transaction(async (tx) => {
      // Store raw event
      const event = await tx.tiveEvent.create({
        data: {
          deviceId: payload.DeviceName,
          deviceImei: payload.DeviceId,
          rawPayload: body as any,
        },
      })

      // Store transformed sensor reading
      const sensor = await tx.sensorReading.create({
        data: {
          eventId: event.id,
          deviceId: sensorData.device_id,
          deviceImei: sensorData.device_imei,
          timestamp: BigInt(sensorData.timestamp),
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          lightLevel: sensorData.light_level,
          accelerometer: sensorData.accelerometer as any,
        },
      })

      // Store transformed location
      const location = await tx.location.create({
        data: {
          eventId: event.id,
          deviceId: locationData.device_id,
          deviceImei: locationData.device_imei,
          timestamp: BigInt(locationData.timestamp),
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          locationAccuracy: locationData.location_accuracy,
          locationSource: locationData.location_source,
          address: locationData.address as any,
          batteryLevel: locationData.battery_level,
          cellularDbm: locationData.cellular_dbm,
          wifiAccessPoints: locationData.wifi_access_points,
        },
      })

      return { event, sensor, location }
    })

    // Return success response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Payload processed successfully',
        eventId: result.event.id,
        sensorId: result.sensor.id,
        locationId: result.location.id,
      },
      { status: 200 }
    )
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Log detailed error for debugging (only in server logs, not exposed to client)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : 'Unknown',
    })
    
    // Check for common database errors
    if (errorMessage.includes('P1001') || errorMessage.includes('Can\'t reach database')) {
      console.error('Database connection error - check DATABASE_URL environment variable')
    }
    if (errorMessage.includes('P2002') || errorMessage.includes('Unique constraint')) {
      console.error('Database constraint error')
    }
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      console.error('Database table missing - run Prisma migrations')
    }
    
    // Don't expose internal errors to client, but log them for debugging
    const response = NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'An error occurred while processing the webhook',
        // In development, you might want to expose more details
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// Health check endpoint
export async function GET() {
  const response = NextResponse.json({ status: 'ok', service: 'paxafe-integration-api' })
  return addCorsHeaders(response)
}

