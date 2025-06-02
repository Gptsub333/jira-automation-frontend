"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ArrowLeft, CheckCircle, Clock, AlertCircle, RefreshCw, Loader } from "lucide-react"

export default function TicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTickets, setSelectedTickets] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  // Fetch tickets from Flask API
  const fetchTickets = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://jira-automation-backend.onrender.com/api/tickets")
      const result = await response.json()

      if (result.success) {
        setTickets(result.data)
      } else {
        setError(result.error || "Failed to fetch tickets")
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure Flask backend is running on http://localhost:5001")
      console.error("Error fetching tickets:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tickets on component mount
  useEffect(() => {
    fetchTickets()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case "Done":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleTicketSelect = (ticketId) => {
    setSelectedTickets((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(tickets.map((ticket) => ticket.status).filter(Boolean))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">Jira Tickets</h1>
              <button
                onClick={fetchTickets}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading tickets...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <h3 className="text-red-400 font-semibold">Error Loading Tickets</h3>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        {!loading && !error && (
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="All">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-400 flex items-center">Total: {tickets.length} tickets</div>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && (
          <div className="grid gap-6 mb-8">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 cursor-pointer hover:border-blue-500/50 ${
                  selectedTickets.includes(ticket.id) ? "border-blue-500 bg-blue-500/10" : "border-gray-700"
                }`}
                onClick={() => handleTicketSelect(ticket.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => handleTicketSelect(ticket.id)}
                      className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{ticket.title || "Untitled Ticket"}</h3>
                      <p className="text-blue-400 font-mono text-sm">{ticket.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}
                    >
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{ticket.status || "Unknown"}</span>
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}
                    >
                      {ticket.priority || "Unknown"}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-2">{ticket.description || "No description available"}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      Assignee: <span className="text-white">{ticket.assignee || "Unassigned"}</span>
                    </span>
                    <span className="text-sm text-gray-400">
                      Type: <span className="text-white">{ticket.type || "Unknown"}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.labels &&
                      ticket.labels.slice(0, 3).map((label, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                          {label}
                        </span>
                      ))}
                    {ticket.labels && ticket.labels.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">
                        +{ticket.labels.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {selectedTickets.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50">
            <div className="flex items-center space-x-4">
              <span className="text-white">
                {selectedTickets.length} ticket{selectedTickets.length > 1 ? "s" : ""} selected
              </span>
              <Link
                href={`/tickets/${selectedTickets[0]}`}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Process Selected
              </Link>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredTickets.length === 0 && tickets.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No tickets found matching your criteria</div>
          </div>
        )}

        {/* No Tickets */}
        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No tickets found in your Jira project</div>
            <p className="text-gray-500 text-sm mt-2">
              Make sure your Flask backend is running and returning ticket data
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
