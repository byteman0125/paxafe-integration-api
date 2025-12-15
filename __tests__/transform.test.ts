import { transformToSensor, transformToLocation } from '@/lib/transform'
import type { TivePayload } from '@/lib/validation'

describe('Transformation Functions', () => {
  const samplePayload: TivePayload = {
    EntityName: 'A571992',
    EntryTimeEpoch: 1739215646000,
    EntryTimeUtc: '2025-02-10T19:27:26Z',
    Cellular: {
      SignalStrength: 'Poor',
      Dbm: -100,
    },
    Temperature: {
      Celsius: 10.078125,
      Fahrenheit: 50.140625,
    },
    ProbeTemperature: null,
    Humidity: {
      Percentage: 38.70000076293945,
    },
    Accelerometer: {
      G: 0.9901862198596787,
      X: -0.5625,
      Y: -0.4375,
      Z: 0.6875,
    },
    Light: {
      Lux: 0,
    },
    Battery: {
      Percentage: 65,
      Estimation: 'N/A',
      IsCharging: false,
    },
    Shipment: {
      Id: 'CL-13686/PHARMA-SHIP/COLD-LOGISTICS',
      Description: null,
      DeviceId: '866088073468439',
      ShipFrom: {
        Latitude: 26.09891,
        Longitude: -98.18494,
        FormattedAddress: '1460 E Hi Line Rd, Pharr, TX 78577, USA',
      },
      ShipTo: {
        Latitude: 40.815468,
        Longitude: -73.8805,
        FormattedAddress: '772 Edgewater Rd, Bronx, NY 10474, USA',
      },
      Carrier: 'EXCALIBUR',
    },
    AccountId: 478,
    DeviceId: '863257063350583',
    DeviceName: 'A571992',
    ShipmentId: 'CL-13686/PHARMA-SHIP/COLD-LOGISTICS',
    PublicShipmentId: '40X614N4WC',
    Location: {
      Latitude: 40.810562,
      Longitude: -73.879285,
      FormattedAddress: '114 Hunts Point Market, Bronx, NY 10474, USA',
      LocationMethod: 'wifi',
      Accuracy: {
        Meters: 23,
        Kilometers: 0.023,
        Miles: 0.014291572942945556,
      },
      GeolocationSourceName: 'skyhook',
      CellTowerUsedCount: 1,
      WifiAccessPointUsedCount: 5,
    },
  }

  describe('transformToSensor', () => {
    it('should transform Tive payload to PAXAFE sensor format', () => {
      const result = transformToSensor(samplePayload)

      expect(result).toEqual({
        device_id: 'A571992',
        device_imei: '863257063350583',
        timestamp: 1739215646000,
        provider: 'Tive',
        type: 'Active',
        temperature: 10.08,
        humidity: 38.7,
        light_level: 0.0,
        accelerometer: {
          x: -0.563,
          y: -0.438,
          z: 0.688,
          magnitude: 0.990,
        },
        tilt: null,
        box_open: null,
      })
    })

    it('should handle null values correctly', () => {
      const minimalPayload: TivePayload = {
        EntryTimeEpoch: 1739215646000,
        DeviceId: '863257063350583',
        DeviceName: 'A571992',
        Temperature: {
          Celsius: 10.0,
        },
        Location: {
          Latitude: 40.0,
          Longitude: -73.0,
        },
      }

      const result = transformToSensor(minimalPayload)

      expect(result.temperature).toBe(10.0)
      expect(result.humidity).toBeNull()
      expect(result.light_level).toBeNull()
      expect(result.accelerometer).toBeNull()
    })

    it('should round values correctly', () => {
      const payload: TivePayload = {
        ...samplePayload,
        Temperature: { Celsius: 10.123456 },
        Humidity: { Percentage: 38.789 },
        Light: { Lux: 125.567 },
      }

      const result = transformToSensor(payload)

      expect(result.temperature).toBe(10.12)
      expect(result.humidity).toBe(38.8)
      expect(result.light_level).toBe(125.6)
    })
  })

  describe('transformToLocation', () => {
    it('should transform Tive payload to PAXAFE location format', () => {
      const result = transformToLocation(samplePayload)

      expect(result).toEqual({
        device_id: 'A571992',
        device_imei: '863257063350583',
        timestamp: 1739215646000,
        provider: 'Tive',
        type: 'Active',
        latitude: 40.810562,
        longitude: -73.879285,
        altitude: null,
        location_accuracy: 23,
        location_accuracy_category: 'Medium',
        location_source: 'WiFi',
        address: {
          full_address: '114 Hunts Point Market, Bronx, NY 10474, USA',
          street: null,
          locality: 'Bronx',
          state: 'NY',
          country: 'USA',
          postal_code: '10474',
        },
        battery_level: 65,
        cellular_dbm: -100.0,
        cellular_network_type: null,
        cellular_operator: null,
        wifi_access_points: 5,
      })
    })

    it('should map location methods correctly', () => {
      const gpsPayload: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          LocationMethod: 'gps',
        },
      }

      const wifiPayload: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          LocationMethod: 'wifi',
        },
      }

      const cellPayload: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          LocationMethod: 'cell',
        },
      }

      expect(transformToLocation(gpsPayload).location_source).toBe('GPS')
      expect(transformToLocation(wifiPayload).location_source).toBe('WiFi')
      expect(transformToLocation(cellPayload).location_source).toBe('Cellular')
    })

    it('should calculate accuracy category correctly', () => {
      const highAccuracy: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          Accuracy: { Meters: 5 },
        },
      }

      const mediumAccuracy: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          Accuracy: { Meters: 25 },
        },
      }

      const lowAccuracy: TivePayload = {
        ...samplePayload,
        Location: {
          ...samplePayload.Location,
          Accuracy: { Meters: 500 },
        },
      }

      expect(transformToLocation(highAccuracy).location_accuracy_category).toBe('High')
      expect(transformToLocation(mediumAccuracy).location_accuracy_category).toBe('Medium')
      expect(transformToLocation(lowAccuracy).location_accuracy_category).toBe('Low')
    })
  })
})

