"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, User, Calendar, Tag, CheckCircle, AlertCircle, Loader, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TicketDetailsPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)

  // Fetch ticket details from API
  const fetchTicketDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://jira-automation-backend.onrender.com/api/tickets/${resolvedParams.id}`)
      const result = await response.json()

      if (result.success) {
        setTicket(result.data)
      } else {
        setError(result.error || "Failed to fetch ticket details")
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure Flask backend is running on http://localhost:5001")
      console.error("Error fetching ticket details:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch ticket on component mount
  useEffect(() => {
    if (resolvedParams.id) {
      fetchTicketDetails()
    }
  }, [resolvedParams.id])

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
      case "Highest":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "Medium":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "Low":
      case "Lowest":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const handleGenerateCode = async () => {
    if (!ticket?.description) {
      setGenerationError("No description available to generate code.")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    try {
      console.log("Sending request to generate code...")
      console.log("Ticket data:", {
        description: ticket.description,
        ticketId: ticket.id,
        title: ticket.title,
      })

      const response = await fetch("https://jira-automation-backend.onrender.com/generate_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: ticket.description,
          ticketId: ticket.id,
          title: ticket.title,
          priority: ticket.priority,
          type: ticket.type,
        }),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (data.error) {
        setGenerationError(data.error)
      } else {
        // Store the generated code in localStorage for the generate page
        const codeData = {
          code: data.code || data.generated_code || "No code generated",
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          timestamp: new Date().toISOString(),
        }

        console.log("Storing code data:", codeData)
        localStorage.setItem("generatedCode", JSON.stringify(codeData))

        // Navigate to generate page
        router.push(`/generate?ticketId=${ticket.id}`)
      }
    } catch (err) {
      console.error("Generate code error:", err)

      // More specific error messages
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setGenerationError(
          "Failed to connect to code generation service. Make sure the Flask backend is running on http://localhost:5000",
        )
      } else if (err.message.includes("CORS")) {
        setGenerationError("CORS error: Make sure the Flask backend has CORS enabled")
      } else {
        setGenerationError(err.message || "Failed to generate code. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/tickets"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Tickets</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Ticket Details</h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-white">
            <Loader className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading ticket details...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link
                href="/tickets"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Tickets</span>
              </Link>
              <h1 className="text-3xl font-bold text-white">Ticket Details</h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Error Loading Ticket</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchTicketDetails}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Ticket not found
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h1>
          <Link href="/tickets" className="text-blue-400 hover:text-blue-300">
            Back to Tickets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/tickets"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Tickets</span>
            </Link>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">Ticket Details</h1>
              <button
                onClick={fetchTicketDetails}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{ticket.title || "Untitled Ticket"}</h2>
              <p className="text-blue-400 font-mono text-lg">{ticket.id}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status || "Unknown"}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getPriorityColor(ticket.priority)}`}
              >
                {ticket.priority || "Unknown"}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Assignee</p>
                <p className="text-white font-medium">{ticket.assignee || "Unassigned"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="text-white font-medium">{ticket.status || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-400 text-sm">Type</p>
                <p className="text-white font-medium">{ticket.type || "Unknown"}</p>
              </div>
            </div>
          </div>

          {ticket.labels && ticket.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.labels.map((label, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-md">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-4">Description</h3>
          <p className="text-gray-300 leading-relaxed">
            {ticket.description || "No description available for this ticket."}
          </p>
        </div>

        {/* Requirements Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Requirements & Notes</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">Implement the functionality described in the ticket description</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">Follow best practices for code quality and documentation</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">Ensure proper testing and error handling</p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-300">Update documentation as needed</p>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Debug Information</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <strong>Ticket ID:</strong> {ticket.id}
              </p>
              <p>
                <strong>Description Length:</strong> {ticket.description?.length || 0} characters
              </p>
              <p>
                <strong>API Endpoint:</strong> http://localhost:5000/generate_code
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          {generationError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-semibold">Code Generation Failed</h4>
                  <p className="text-red-300 text-sm mt-1">{generationError}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Code...</span>
              </>
            ) : (
              <>
                <span>Generate Code for {ticket.id}</span>
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
