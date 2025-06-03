"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Copy, Download, Edit3, Sparkles, AlertCircle, Check } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function GeneratePage() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get("ticketId")
  const [isGenerating, setIsGenerating] = useState(true)
  const [code, setCode] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [ticketTitle, setTicketTitle] = useState("")

    // File extension editing
  const [fileExtension, setFileExtension] = useState("js")
  const [isEditingExtension, setIsEditingExtension] = useState(false)
  const [tempExtension, setTempExtension] = useState("js")

  useEffect(() => {
    // Simulate loading time then get code from localStorage
    const timer = setTimeout(() => {
      try {
        const storedData = localStorage.getItem("generatedCode")
        if (storedData) {
          const data = JSON.parse(storedData)
          if (data.ticketId === ticketId) {
            setCode(data.code || "No code was generated.")
            setTicketTitle(data.ticketTitle || "")
            if (data.fileExtension) {
              setFileExtension(data.fileExtension)
              setTempExtension(data.fileExtension)
            }
          } else {
            setError("No generated code found for this ticket.")
          }
        } else {
          setError("No generated code found. Please go back and generate code first.")
        }
      } catch (err) {
        setError("Error loading generated code.")
      }
      setIsGenerating(false)
    }, 1000) // Reduced from 3000ms to 1000ms for faster loading

    return () => clearTimeout(timer)
  }, [ticketId])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  const handleDownload = () => {
    const filename = `${ticketId || "generated"}-code.${fileExtension}`
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCodeChange = (e) => {
    setCode(e.target.value)

    // Update the code in localStorage so it's available for deployment
    try {
      const storedData = localStorage.getItem("generatedCode")
      if (storedData) {
        const data = JSON.parse(storedData)
        data.code = e.target.value
        localStorage.setItem("generatedCode", JSON.stringify(data))
      }
    } catch (err) {
      console.error("Failed to update code in storage:", err)
    }
  }
  const startEditingExtension = () => {
    setTempExtension(fileExtension)
    setIsEditingExtension(true)
  }
  const saveExtension = () => {
    // Validate extension (remove spaces, dots, etc.)
    const cleanExtension = tempExtension.trim().replace(/^\.+/, "").replace(/\s+/g, "")

    if (cleanExtension) {
      setFileExtension(cleanExtension)

      // Save to localStorage
      try {
        const storedData = localStorage.getItem("generatedCode")
        if (storedData) {
          const data = JSON.parse(storedData)
          data.fileExtension = cleanExtension
          localStorage.setItem("generatedCode", JSON.stringify(data))
        }
      } catch (err) {
        console.error("Failed to update file extension in storage:", err)
      }
    } else {
      setTempExtension("js") // Default to js if empty
    }

    setIsEditingExtension(false)
  }

  const handleExtensionKeyDown = (e) => {
    if (e.key === "Enter") {
      saveExtension()
    } else if (e.key === "Escape") {
      setIsEditingExtension(false)
      setTempExtension(fileExtension)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href={ticketId ? `/tickets/${ticketId}` : "/tickets"}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Ticket</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Code Generation</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isGenerating ? (
          // Loading State
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Loading Generated Code...</h2>
            <p className="text-gray-300 text-center max-w-md">
              Retrieving your generated code for review and deployment.
            </p>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Code</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <Link
                href="/tickets"
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Tickets</span>
              </Link>
            </div>
          </div>
        ) : (
          // Generated Code Display
          <div className="space-y-8">
            {/* Success Message */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">Code Generated Successfully!</h3>
                  <p className="text-green-300">
                    Code for {ticketId} {ticketTitle && `- ${ticketTitle}`} is ready for review and deployment.
                  </p>
                </div>
              </div>
            </div>

            {/* Code Preview */}
              {/* Code Preview */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">Generated Code</h3>
                  <div className="flex items-center">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-l border-l border-y border-blue-500/20">
                      {ticketId || "generated"}-code
                    </span>
                    {isEditingExtension ? (
                      <div className="flex items-center">
                        <span className="text-blue-400 text-xs">.</span>
                        <input
                          type="text"
                          value={tempExtension}
                          onChange={(e) => setTempExtension(e.target.value)}
                          onBlur={saveExtension}
                          onKeyDown={handleExtensionKeyDown}
                          className="w-12 px-1 py-1 bg-blue-500/10 text-blue-400 text-xs border-r border-y border-blue-500/20 rounded-r focus:outline-none focus:ring-1 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="flex items-center cursor-pointer group" onClick={startEditingExtension}>
                        <span className="text-blue-400 text-xs">.</span>
                        <span className="px-1 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-r border-r border-y border-blue-500/20 group-hover:bg-blue-500/20">
                          {fileExtension}
                        </span>
                        <Edit3 className="h-3 w-3 text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditing ? "View" : "Edit"}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                {isEditing ? (
                  <textarea
                    value={code}
                    onChange={handleCodeChange}
                    className="w-full h-96 p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none"
                    style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                  />
                ) : (
                  <pre className="p-4 bg-gray-900 text-gray-300 font-mono text-sm overflow-x-auto h-96 overflow-y-auto">
                    <code>{code}</code>
                  </pre>
                )}
              </div>
            </div>

            {/* Code Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Code Features</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>AI-generated based on ticket requirements</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Production-ready code structure</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Best practices implementation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Error handling and validation</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Next Steps</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Review and test the generated code</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Make any necessary adjustments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Deploy to your GitHub repository</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Update documentation as needed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-center">
              <Link
                href={`/deploy?ticketId=${ticketId}`}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                <span>Deploy to GitHub</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
