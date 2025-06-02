"use client"

import { useEffect, useRef } from "react"

export default function GlowingShapes() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Create shapes
    const createShape = (className) => {
      const shape = document.createElement("div")
      shape.className = className

      // Random position
      shape.style.left = `${Math.random() * 100}%`
      shape.style.top = `${Math.random() * 100}%`

      // Random size
      const size = Math.random() * 300 + 100
      shape.style.width = `${size}px`
      shape.style.height = `${size}px`

      // Random animation duration
      shape.style.animationDuration = `${Math.random() * 20 + 15}s`

      // Random delay
      shape.style.animationDelay = `${Math.random() * 5}s`

      // Random opacity
      shape.style.opacity = Math.random() * 0.07 + 0.03

      return shape
    }

    // Add shapes
    const shapes = []
    const shapeCount = 6

    for (let i = 0; i < shapeCount; i++) {
      const isCircle = Math.random() > 0.5
      const shape = createShape(
        isCircle
          ? "absolute rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-3xl animate-float"
          : "absolute bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-float rotate-12",
      )
      container.appendChild(shape)
      shapes.push(shape)
    }

    // Cleanup
    return () => {
      shapes.forEach((shape) => shape.remove())
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0"></div>
}
