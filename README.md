# PAXAFE Integration API

A production-ready webhook receiver that transforms Tive IoT device payloads into PAXAFE standardized formats and stores them in PostgreSQL.

## Features

- ✅ Validates incoming Tive webhook payloads against schema
- ✅ Transforms to PAXAFE sensor and location formats
- ✅ Stores raw payloads (JSONB) and normalized data
- ✅ API key authentication
- ✅ Comprehensive error handling
- ✅ Unit tests for transformation logic
- ✅ Optimized for performance (memoized schemas, efficient rounding)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod
- **Testing**: Jest

## Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or managed like Neon/Supabase)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/paxafe_integration?schema=public"
API_KEY="your-secret-api-key-here"
```

4. Set up database:
```bash
npx prisma generate
npx prisma db push
```

5. Run development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### POST /api/webhook/tive

Receives Tive webhook payloads, validates, transforms, and stores them.

**Authentication**: 
- Header: `Authorization: Bearer <API_KEY>` OR
- Header: `X-API-Key: <API_KEY>`

**Request Body**: Tive payload (see `tive-incoming-schema.json`)

**Response**:
```json
{
  "success": true,
  "message": "Payload processed successfully",
  "eventId": "clx...",
  "sensorId": "clx...",
  "locationId": "clx..."
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing API key
- `400 Bad Request`: Invalid JSON or validation error
- `500 Internal Server Error`: Server error

### GET /api/webhook/tive

Health check endpoint.

## Database Schema

- **tive_events**: Raw webhook payloads (JSONB)
- **sensor_readings**: Transformed PAXAFE sensor data
- **locations**: Transformed PAXAFE location data

All tables are indexed for optimal query performance.

## Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `API_KEY`
4. Deploy

The API will automatically run Prisma migrations on deployment.

## Assumptions & Design Decisions

1. **Raw Payload Storage**: Stored in JSONB for audit trail and future extensibility
2. **Dual Storage**: Both raw and transformed data stored for flexibility
3. **API Key Auth**: Simple env-based auth (extensible to DB-backed keys)
4. **Transaction Safety**: All database writes in a transaction for atomicity
5. **Error Handling**: Detailed validation errors, but generic 500s to avoid exposing internals
6. **Performance**: Memoized Zod schemas, efficient rounding functions, indexed queries

## Project Structure

```
integration-api/
├── app/
│   └── api/
│       └── webhook/
│           └── tive/
│               └── route.ts       # Webhook endpoint
├── lib/
│   ├── auth.ts                    # API key validation
│   ├── prisma.ts                  # Prisma client
│   ├── transform.ts               # Tive → PAXAFE transformations
│   └── validation.ts              # Zod schemas
├── prisma/
│   └── schema.prisma              # Database schema
└── __tests__/
    └── transform.test.ts          # Transformation tests
```

