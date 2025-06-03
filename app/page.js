"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Zap, GitBranch, Bot, Sparkles } from "lucide-react"
import HeroBackground from "../components/HeroBackground"
import GlowingShapes from "../components/GlowingShapes"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <HeroBackground />
      <GlowingShapes />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 pointer-events-none z-0"></div>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Ankush&apos;s Builder</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Automate Your
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {" "}
                Development
              </span>
              <br />
              Workflow
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform Jira tickets into production-ready code automatically. Extract requirements, generate code with
              AI, and deploy to GitHub seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/tickets"
                className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Start Automating</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Powerful Automation Features</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Streamline your development process with our cutting-edge AI-powered automation tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="bg-blue-500/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Ticket Extraction</h3>
              <p className="text-gray-300 leading-relaxed">
                Automatically fetch and analyze Jira tickets, extracting key requirements and acceptance criteria with
                precision.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="bg-purple-500/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Bot className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Code Generation</h3>
              <p className="text-gray-300 leading-relaxed">
                Leverage advanced LLM models to generate production-ready code based on your ticket requirements and
                specifications.
              </p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300 group">
              <div className="bg-green-500/10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <GitBranch className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">GitHub Integration</h3>
              <p className="text-gray-300 leading-relaxed">
                Seamlessly push generated code to your GitHub repositories with automatic branch management and commit
                messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  )
}
