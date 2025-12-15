import { NextRequest, NextResponse } from 'next/server'
import { getTiveSchema } from '@/lib/validation'
import { transformToSensor, transformToLocation } from '@/lib/transform'
import { validateApiKey, getApiKeyFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const apiKey = getApiKeyFromRequest(request.headers)
    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    // Parse and validate payload
    let body: unknown
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    const schema = getTiveSchema()
    const validationResult = schema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation Error', 
          message: 'Payload does not match Tive schema',
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
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
    return NextResponse.json(
      {
        success: true,
        message: 'Payload processed successfully',
        eventId: result.event.id,
        sensorId: result.sensor.id,
        locationId: result.location.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Don't expose internal errors
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'An error occurred while processing the webhook' 
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'paxafe-integration-api' })
}

