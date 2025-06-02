"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Github,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Folder,
  Settings,
  Loader,
  RefreshCw,
  Edit3,
  Code,
  ExternalLink,
} from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function DeployPage() {
  const searchParams = useSearchParams()
  const ticketId = searchParams.get("ticketId")

  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRepo, setSelectedRepo] = useState("")
  const [branch, setBranch] = useState("main")
  const [commitMessage, setCommitMessage] = useState("")
  const [filePath, setFilePath] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)
  const [jiraUpdateStatus, setJiraUpdateStatus] = useState(null)

  // Code editor state
  const [generatedCode, setGeneratedCode] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [codeError, setCodeError] = useState(null)

  // Fetch repositories from API
  const fetchRepositories = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching repositories from API...")

      const response = await fetch("https://jira-automation-backend.onrender.com/repos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (data.success) {
        // Transform the repos array into the format we need
        const repoData = data.repos.map((repoName, index) => ({
          id: index + 1,
          name: repoName,
          description: `Repository: ${repoName}`,
          private: Math.random() > 0.7, // Randomly assign some repos as private
        }))

        console.log("Transformed repo data:", repoData)
        setRepositories(repoData)
      } else {
        throw new Error(data.error || "Failed to fetch repositories")
      }
    } catch (err) {
      console.error("Error fetching repositories:", err)

      // More specific error messages
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Failed to connect to GitHub API service. Make sure the Flask backend is running on http://localhost:5003",
        )
      } else if (err.message.includes("CORS")) {
        setError("CORS error: Make sure the Flask backend has CORS enabled")
      } else {
        setError(err.message || "Failed to fetch repositories. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Load generated code from localStorage
  const loadGeneratedCode = () => {
    try {
      const storedData = localStorage.getItem("generatedCode")
      if (storedData) {
        const data = JSON.parse(storedData)
        setGeneratedCode(data.code || "")

        // Set default file path and commit message based on ticket info
        if (data.ticketId) {
          setFilePath(`src/${data.ticketId.toLowerCase()}.js`)
          setCommitMessage(`feat: implement ${data.ticketId} - ${data.ticketTitle || "code generation"}`)
        }
      } else {
        setCodeError("No generated code found. Please go back and generate code first.")
      }
    } catch (err) {
      console.error("Error loading generated code:", err)
      setCodeError("Error loading generated code from storage.")
    }
  }

  // Update Jira ticket with commit information
  const updateJiraTicket = async (commitUrl) => {
    if (!ticketId) {
      console.log("No ticket ID available, skipping Jira update")
      return
    }

    setJiraUpdateStatus("updating")

    try {
      console.log("Updating Jira ticket with commit information...")

      const jiraPayload = {
        jira_ticket: ticketId,
        commit_message: commitMessage,
        commit_url: commitUrl,
      }

      console.log("Jira update payload:", jiraPayload)

      const response = await fetch("https://jira-automation-backend.onrender.com/add-commit-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jiraPayload),
      })

      console.log("Jira update response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Jira update error response:", errorText)
        throw new Error(`Jira API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Jira update result:", result)

      if (result.success) {
        setJiraUpdateStatus("success")
      } else {
        throw new Error(result.error || "Failed to update Jira ticket")
      }
    } catch (err) {
      console.error("Error updating Jira ticket:", err)
      setJiraUpdateStatus("error")
      // Don't fail the entire deployment if Jira update fails
      console.log("Jira update failed, but deployment was successful")
    }
  }

  // Fetch repositories and load code on component mount
  useEffect(() => {
    fetchRepositories()
    loadGeneratedCode()
  }, [])

  const handleDeploy = async () => {
    if (!selectedRepo) {
      alert("Please select a repository")
      return
    }

    if (!generatedCode) {
      alert("No code to deploy")
      return
    }

    setIsDeploying(true)
    setDeploymentStatus(null)
    setDeploymentResult(null)
    setJiraUpdateStatus(null)

    try {
      console.log("Deploying code to GitHub...")
      console.log("Repository:", selectedRepo)
      console.log("File path:", filePath)
      console.log("Commit message:", commitMessage)

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("repo", selectedRepo)
      formData.append("file_path", filePath)
      formData.append("commit_message", commitMessage)

      // Create a Blob from the code and add it as a file
      const codeBlob = new Blob([generatedCode], { type: "text/javascript" })
      formData.append("file", codeBlob, filePath.split("/").pop())

      // Send the request to the API
      const response = await fetch("https://jira-automation-backend.onrender.com/push-file", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Deployment result:", result)

      if (result.success) {
        setDeploymentStatus("success")
        setDeploymentResult(result.result)

        // Generate commit URL from the deployment result
        let commitUrl = null
        if (result.result && result.result.commit && result.result.commit.html_url) {
          commitUrl = result.result.commit.html_url
        } else if (result.result && result.result.commit && result.result.commit.sha) {
          // Fallback: construct URL from repository and commit SHA
          commitUrl = `https://github.com/${selectedRepo}/commit/${result.result.commit.sha}`
        }

        console.log("Generated commit URL:", commitUrl)

        // Update Jira ticket with commit information
        if (commitUrl) {
          await updateJiraTicket(commitUrl)
        }
      } else {
        throw new Error(result.error || "Failed to deploy code")
      }
    } catch (err) {
      console.error("Deployment error:", err)
      setDeploymentStatus("error")
      setError(err.message || "Failed to deploy code. Please try again.")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/generate"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Code</span>
            </Link>
            <h1 className="text-3xl font-bold text-white">Deploy to GitHub</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {deploymentStatus === "success" ? (
          // Success State
          <div className="text-center space-y-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Deployment Successful!</h2>
              <p className="text-green-300 text-lg mb-6">
                Your code has been successfully pushed to GitHub repository.
              </p>

              {/* Deployment Details */}
              <div className="bg-gray-800/50 rounded-lg p-4 text-left mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Github className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Repository:</span>
                  <span className="text-white font-medium">{selectedRepo}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Branch:</span>
                  <span className="text-white font-medium">{branch}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">File:</span>
                  <span className="text-white font-medium">{filePath}</span>
                </div>
                {deploymentResult && deploymentResult.commit && (
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-300">Commit:</span>
                    <a
                      href={deploymentResult.commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      {deploymentResult.commit.sha?.substring(0, 7) || "View"}
                    </a>
                  </div>
                )}
              </div>

              {/* Jira Update Status */}
              {ticketId && (
                <div className="bg-gray-800/50 rounded-lg p-4 text-left mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Jira Ticket Update</h3>
                  <div className="flex items-center space-x-3">
                    {jiraUpdateStatus === "updating" && (
                      <>
                        <Loader className="h-5 w-5 text-blue-400 animate-spin" />
                        <span className="text-blue-300">Updating Jira ticket {ticketId}...</span>
                      </>
                    )}
                    {jiraUpdateStatus === "success" && (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-300">
                          Successfully updated Jira ticket {ticketId} with commit information
                        </span>
                      </>
                    )}
                    {jiraUpdateStatus === "error" && (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                        <span className="text-yellow-300">
                          Deployment successful, but failed to update Jira ticket {ticketId}
                        </span>
                      </>
                    )}
                    {!jiraUpdateStatus && (
                      <>
                        <AlertCircle className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">No Jira ticket update required</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {deploymentResult && deploymentResult.content && (
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">File Details</h3>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300">
                      <strong>Size:</strong> {deploymentResult.content?.size || 0} bytes
                    </p>
                    <p className="text-gray-300">
                      <strong>Encoding:</strong> {deploymentResult.content?.encoding || "base64"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <a
                href={`https://github.com/${selectedRepo}/blob/${branch}/${filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Code className="h-5 w-5" />
                <span>View File on GitHub</span>
                <ExternalLink className="h-4 w-4" />
              </a> */}
              {deploymentResult && deploymentResult.commit && deploymentResult.commit.html_url && (
                <a
                  href={deploymentResult.commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Github className="h-5 w-5" />
                  <span>View Commit</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Link
                href="/tickets"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                <span>Process Another Ticket</span>
              </Link>
            </div>
          </div>
        ) : (
          // Configuration Form
          <div className="space-y-8">
            {/* Code Preview/Editor */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">Code to Deploy</h3>
                  {ticketId && (
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                      {ticketId}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{isEditing ? "View" : "Edit"}</span>
                </button>
              </div>

              {codeError ? (
                <div className="p-4 bg-red-500/10 text-red-300">
                  <p>{codeError}</p>
                  <Link href="/generate" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                    Go back to generate code
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  {isEditing ? (
                    <textarea
                      value={generatedCode}
                      onChange={(e) => setGeneratedCode(e.target.value)}
                      className="w-full h-64 p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none focus:outline-none"
                      style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                    />
                  ) : (
                    <pre className="p-4 bg-gray-900 text-gray-300 font-mono text-sm overflow-x-auto h-64 overflow-y-auto">
                      <code>{generatedCode}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Repository Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Github className="h-6 w-6" />
                  <span>Select Repository</span>
                </h2>

                {!loading && (
                  <button
                    onClick={fetchRepositories}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-white">
                    <Loader className="h-6 w-6 animate-spin" />
                    <span className="text-lg">Loading repositories from GitHub...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold">Error Loading Repositories</h4>
                      <p className="text-red-300 text-sm mt-1">{error}</p>
                      <button
                        onClick={fetchRepositories}
                        className="mt-2 flex items-center space-x-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Try Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Repository List */}
              {!loading && !error && (
                <div className="grid gap-4">
                  {repositories.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No repositories found. Please refresh or check your GitHub connection.
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-400 mb-4">Found {repositories.length} repositories</div>
                      <div className="max-h-64 overflow-y-auto pr-2">
                        {repositories.map((repo) => (
                          <div
                            key={repo.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 mb-2 ${
                              selectedRepo === repo.name
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-600 hover:border-gray-500"
                            }`}
                            onClick={() => setSelectedRepo(repo.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  checked={selectedRepo === repo.name}
                                  onChange={() => setSelectedRepo(repo.name)}
                                  className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600"
                                />
                                <div>
                                  <h3 className="text-white font-medium">{repo.name}</h3>
                                  <p className="text-gray-400 text-sm">{repo.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {repo.private && (
                                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">
                                    Private
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Deployment Configuration */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Settings className="h-6 w-6" />
                <span>Deployment Configuration</span>
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Target Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="main"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">File Path</label>
                  <input
                    type="text"
                    value={filePath}
                    onChange={(e) => setFilePath(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="src/services/auth-service.js"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">Commit Message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="feat: add user authentication system"
                />
              </div>
            </div>

            {/* Deployment Preview */}
            {selectedRepo && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">Deployment Preview</h3>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-400 mb-2"># Deployment Summary</div>
                  <div className="text-green-400">Repository: {selectedRepo}</div>
                  <div className="text-blue-400">Branch: {branch}</div>
                  <div className="text-yellow-400">File: {filePath}</div>
                  <div className="text-purple-400">Message: {commitMessage}</div>
                  <div className="text-gray-400 mt-2">Code size: {generatedCode.length} characters</div>
                  {ticketId && <div className="text-orange-400">Jira Ticket: {ticketId}</div>}
                </div>
              </div>
            )}

            {/* Deploy Button */}
            <div className="text-center">
              {deploymentStatus === "error" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold">Deployment Failed</h4>
                      <p className="text-red-300 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {isDeploying ? (
                <div className="inline-flex items-center space-x-3 bg-gray-700 text-gray-300 px-8 py-4 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Deploying to GitHub...</span>
                </div>
              ) : (
                <button
                  onClick={handleDeploy}
                  disabled={!selectedRepo || !generatedCode || !filePath}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github className="h-5 w-5" />
                  <span>Deploy to GitHub</span>
                </button>
              )}
            </div>

            {/* Deployment Steps */}
            {isDeploying && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Deployment Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Preparing code for deployment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                    <span className="text-gray-300">Pushing to GitHub repository</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-500">Creating commit</span>
                  </div>
                  {ticketId && (
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-500">Updating Jira ticket</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
