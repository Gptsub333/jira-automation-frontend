import { Inter } from "next/font/google"
import "./globals.css"
import Footer from "../components/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Jira Soda - AI-Powered Development Automation",
  description: "Transform Jira tickets into production-ready code automatically with AI-powered automation tools.",
  keywords: "AI, automation, Jira, GitHub, code generation, development tools",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
