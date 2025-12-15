'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'

export default function Home() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState('/api/webhook/tive')

  // Get current URL for the API endpoint (client-side only to avoid hydration mismatch)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiEndpoint(`${window.location.origin}/api/webhook/tive`)
    }
  }, [])

  // Get API key from environment (client-side, so we'll need to handle this carefully)
  // Note: API key should ideally come from a server-side API route for security
  // For now, we'll show a placeholder that users need to get from Vercel
  const apiKeyPlaceholder = 'Get from Vercel Environment Variables'

  const copyToClipboard = async (text: string, type: 'endpoint' | 'key') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'endpoint') {
        setCopiedEndpoint(true)
        setTimeout(() => setCopiedEndpoint(false), 2000)
      } else {
        setCopiedApiKey(true)
        setTimeout(() => setCopiedApiKey(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">PAXAFE Integration API</h1>
          <p className="text-gray-600">Tive webhook receiver and transformer</p>
        </div>

        {/* API Endpoint Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Endpoint</h2>
              <p className="text-sm text-gray-500 mt-1">Webhook URL for receiving Tive payloads</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 font-mono text-sm text-gray-800 break-all">
              {apiEndpoint}
            </div>
            <button
              onClick={() => copyToClipboard(apiEndpoint, 'endpoint')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              {copiedEndpoint ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p><strong>Method:</strong> POST</p>
            <p><strong>Authentication:</strong> Bearer token or X-API-Key header</p>
            <p><strong>Health Check:</strong> GET {apiEndpoint}</p>
          </div>
        </div>

        {/* API Key Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">API Key</h2>
              <p className="text-sm text-gray-500 mt-1">Set in Vercel Environment Variables as <code className="bg-gray-100 px-1 rounded">API_KEY</code></p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-4 py-3 font-mono text-sm text-gray-800">
                {showApiKey ? (
                  <span className="text-red-600 font-semibold">
                    ⚠️ API Key is stored in Vercel Environment Variables
                  </span>
                ) : (
                  <span className="text-gray-500">••••••••••••••••••••••••••••••••</span>
                )}
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                {showApiKey ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Info
                  </>
                )}
              </button>
            </div>

            {showApiKey && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>How to get your API Key:</strong>
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to your Vercel Dashboard</li>
                  <li>Select the <code className="bg-blue-100 px-1 rounded">paxafe-integration-api</code> project</li>
                  <li>Navigate to <strong>Settings → Environment Variables</strong></li>
                  <li>Find the <code className="bg-blue-100 px-1 rounded">API_KEY</code> variable</li>
                  <li>Copy the value and use it in your Mock Sender or API requests</li>
                </ol>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>💡</span>
              <span>For security, the API key is not exposed in this interface. Get it from Vercel Environment Variables.</span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Quick Start</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1. Get your API Key:</strong> Copy from Vercel Environment Variables</p>
            <p><strong>2. Use in Mock Sender:</strong> Paste the API endpoint and key in the Mock Sender configuration</p>
            <p><strong>3. Send Test Payload:</strong> Use the Mock Sender to send test Tive payloads</p>
          </div>
        </div>
      </div>
    </div>
  )
}
