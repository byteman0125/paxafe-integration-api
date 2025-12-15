export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">PAXAFE Integration API</h1>
        <p className="text-gray-600">Webhook endpoint: POST /api/webhook/tive</p>
        <p className="text-sm text-gray-500">Health check: GET /api/webhook/tive</p>
      </div>
    </div>
  )
}

