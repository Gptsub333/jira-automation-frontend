"use client"

import { useEffect, useRef } from "react"

export default function HeroBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []
    let mouseX = 0
    let mouseY = 0
    let hue = 220 // Start with blue hue

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Track mouse movement
    const handleMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Particle class
    class Particle {
      constructor(x, y) {
        this.x = x || Math.random() * canvas.width
        this.y = y || Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.color = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.3 + 0.1})`
        this.originalX = this.x
        this.originalY = this.y
        this.density = Math.random() * 30 + 1
        this.angle = Math.random() * 360
        this.angleSpeed = Math.random() * 0.5 + 0.1
      }

      update() {
        // Subtle movement
        this.angle += this.angleSpeed
        this.x = this.originalX + Math.cos(this.angle * (Math.PI / 180)) * 20
        this.y = this.originalY + Math.sin(this.angle * (Math.PI / 180)) * 20

        // Mouse interaction
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance
        const maxDistance = 200
        const force = (maxDistance - distance) / maxDistance

        if (distance < maxDistance) {
          this.x -= forceDirectionX * force * this.density
          this.y -= forceDirectionY * force * this.density
        } else {
          if (this.x !== this.originalX) {
            const dx = this.x - this.originalX
            this.x -= dx / 20
          }
          if (this.y !== this.originalY) {
            const dy = this.y - this.originalY
            this.y -= dy / 20
          }
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Create particles
    const createParticles = () => {
      const particleCount = Math.min(Math.floor(window.innerWidth * 0.1), 150)
      particles = []

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    createParticles()

    // Create grid lines
    const gridLines = []
    const createGridLines = () => {
      const spacing = 100
      const xCount = Math.ceil(canvas.width / spacing)
      const yCount = Math.ceil(canvas.height / spacing)

      for (let x = 0; x <= xCount; x++) {
        gridLines.push({
          x1: x * spacing,
          y1: 0,
          x2: x * spacing,
          y2: canvas.height,
          color: `rgba(255, 255, 255, 0.03)`,
        })
      }

      for (let y = 0; y <= yCount; y++) {
        gridLines.push({
          x1: 0,
          y1: y * spacing,
          x2: canvas.width,
          y2: y * spacing,
          color: `rgba(255, 255, 255, 0.03)`,
        })
      }
    }

    createGridLines()

    // Create glowing orbs
    const orbs = []
    const createOrbs = () => {
      orbs.push({
        x: canvas.width * 0.2,
        y: canvas.height * 0.3,
        radius: 150,
        color: "rgba(59, 130, 246, 0.05)", // Blue
      })
      orbs.push({
        x: canvas.width * 0.8,
        y: canvas.height * 0.7,
        radius: 200,
        color: "rgba(139, 92, 246, 0.05)", // Purple
      })
    }

    createOrbs()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw orbs
      orbs.forEach((orb) => {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        gradient.addColorStop(0, orb.color.replace("0.05", "0.15"))
        gradient.addColorStop(1, orb.color.replace("0.05", "0"))
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw grid lines
      gridLines.forEach((line) => {
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.strokeStyle = line.color
        ctx.stroke()
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Slowly shift hue
      hue = (hue + 0.1) % 360

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
