import { z } from 'zod'

// Memoized compiled schemas for performance
let tiveSchema: z.ZodType<any> | null = null

export const getTiveSchema = (): z.ZodType<any> => {
  if (tiveSchema) return tiveSchema

  tiveSchema = z.object({
    EntityName: z.string().optional(),
    EntryTimeEpoch: z.number().int().min(0),
    EntryTimeUtc: z.string().datetime().optional(),
    Cellular: z.object({
      SignalStrength: z.enum(['No signal', 'Poor', 'Fair', 'Good']).nullable().optional(),
      Dbm: z.number().min(-150).max(-50).nullable().optional(),
    }).nullable().optional(),
    Temperature: z.object({
      Celsius: z.number().nullable(),
      Fahrenheit: z.number().nullable().optional(),
    }),
    ProbeTemperature: z.object({
      Celsius: z.number().nullable().optional(),
      Fahrenheit: z.number().nullable().optional(),
    }).nullable().optional(),
    Humidity: z.object({
      Percentage: z.number().min(0).max(100).nullable().optional(),
    }).nullable().optional(),
    Accelerometer: z.object({
      G: z.number().nullable().optional(),
      X: z.number().nullable().optional(),
      Y: z.number().nullable().optional(),
      Z: z.number().nullable().optional(),
    }).nullable().optional(),
    Light: z.object({
      Lux: z.number().min(0).nullable().optional(),
    }).nullable().optional(),
    Battery: z.object({
      Percentage: z.number().int().min(0).max(100).nullable().optional(),
      Estimation: z.enum(['N/A', 'Days', 'Weeks', 'Months']).nullable().optional(),
      IsCharging: z.boolean().nullable().optional(),
    }).nullable().optional(),
    Shipment: z.object({
      Id: z.string().nullable().optional(),
      Description: z.string().nullable().optional(),
      DeviceId: z.string().nullable().optional(),
      ShipFrom: z.object({
        Latitude: z.number().nullable().optional(),
        Longitude: z.number().nullable().optional(),
        FormattedAddress: z.string().nullable().optional(),
      }).nullable().optional(),
      ShipTo: z.object({
        Latitude: z.number().nullable().optional(),
        Longitude: z.number().nullable().optional(),
        FormattedAddress: z.string().nullable().optional(),
      }).nullable().optional(),
      Carrier: z.string().nullable().optional(),
    }).nullable().optional(),
    AccountId: z.number().int().optional(),
    DeviceId: z.string().regex(/^[0-9]{15}$/),
    DeviceName: z.string(),
    ShipmentId: z.string().nullable().optional(),
    PublicShipmentId: z.string().nullable().optional(),
    Location: z.object({
      Latitude: z.number().min(-90).max(90),
      Longitude: z.number().min(-180).max(180),
      FormattedAddress: z.string().nullable().optional(),
      LocationMethod: z.enum(['gps', 'wifi', 'cell']).nullable().optional(),
      Accuracy: z.object({
        Meters: z.number().nullable().optional(),
        Kilometers: z.number().nullable().optional(),
        Miles: z.number().nullable().optional(),
      }).nullable().optional(),
      GeolocationSourceName: z.string().nullable().optional(),
      CellTowerUsedCount: z.number().int().nullable().optional(),
      WifiAccessPointUsedCount: z.number().int().nullable().optional(),
    }),
  })

  return tiveSchema
}

export type TivePayload = z.infer<ReturnType<typeof getTiveSchema>>

