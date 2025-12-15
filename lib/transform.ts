import type { TivePayload } from './validation'

// Reusable rounding functions for performance
const round2 = (n: number | null | undefined): number | null => 
  n != null ? Math.round(n * 100) / 100 : null

const round1 = (n: number | null | undefined): number | null => 
  n != null ? Math.round(n * 10) / 10 : null

const round3 = (n: number | null | undefined): number | null => 
  n != null ? Math.round(n * 1000) / 1000 : null

// Reusable location source mapper
const mapLocationSource = (method: string | null | undefined): string | null => {
  if (!method) return null
  switch (method.toLowerCase()) {
    case 'gps': return 'GPS'
    case 'wifi': return 'WiFi'
    case 'cell': return 'Cellular'
    default: return method.charAt(0).toUpperCase() + method.slice(1)
  }
}

// Parse address from formatted string (simple extraction)
const parseAddress = (formatted: string | null | undefined): any => {
  if (!formatted) return null
  
  // Simple parsing - extract postal code if present
  const postalMatch = formatted.match(/\b\d{5}(-\d{4})?\b/)
  const postalCode = postalMatch ? postalMatch[0] : null
  
  // Extract state (2-letter code before postal)
  const stateMatch = formatted.match(/\b([A-Z]{2})\s+\d{5}/)
  const state = stateMatch ? stateMatch[1] : null
  
  // Extract country (usually at end)
  const parts = formatted.split(',')
  const country = parts.length > 1 ? parts[parts.length - 1].trim() : null
  const locality = parts.length > 2 ? parts[parts.length - 2].trim() : null
  
  return {
    full_address: formatted,
    street: null,
    locality: locality || null,
    state: state || null,
    country: country || null,
    postal_code: postalCode || null,
  }
}

// Transform to PAXAFE Sensor format
export const transformToSensor = (payload: TivePayload) => {
  const accelerometer = payload.Accelerometer ? {
    x: round3(payload.Accelerometer.X),
    y: round3(payload.Accelerometer.Y),
    z: round3(payload.Accelerometer.Z),
    magnitude: round3(payload.Accelerometer.G),
  } : null

  return {
    device_id: payload.DeviceName,
    device_imei: payload.DeviceId,
    timestamp: payload.EntryTimeEpoch,
    provider: 'Tive' as const,
    type: 'Active' as const,
    temperature: round2(payload.Temperature?.Celsius),
    humidity: round1(payload.Humidity?.Percentage),
    light_level: round1(payload.Light?.Lux),
    accelerometer,
    tilt: null,
    box_open: null,
  }
}

// Transform to PAXAFE Location format
export const transformToLocation = (payload: TivePayload) => {
  return {
    device_id: payload.DeviceName,
    device_imei: payload.DeviceId,
    timestamp: payload.EntryTimeEpoch,
    provider: 'Tive' as const,
    type: 'Active' as const,
    latitude: payload.Location.Latitude,
    longitude: payload.Location.Longitude,
    altitude: null,
    location_accuracy: payload.Location.Accuracy?.Meters 
      ? Math.round(payload.Location.Accuracy.Meters) 
      : null,
    location_accuracy_category: payload.Location.Accuracy?.Meters
      ? payload.Location.Accuracy.Meters <= 10 ? 'High'
        : payload.Location.Accuracy.Meters <= 50 ? 'Medium'
        : 'Low'
      : null,
    location_source: mapLocationSource(payload.Location.LocationMethod),
    address: parseAddress(payload.Location.FormattedAddress),
    battery_level: payload.Battery?.Percentage ?? null,
    cellular_dbm: round2(payload.Cellular?.Dbm),
    cellular_network_type: null,
    cellular_operator: null,
    wifi_access_points: payload.Location.WifiAccessPointUsedCount ?? null,
  }
}

