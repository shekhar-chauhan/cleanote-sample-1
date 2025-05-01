"use client"

import { useState, useEffect } from "react"
import LoginScreen from "../components/login-screen"
import NoteApp from "../components/note-app"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInStatus = localStorage.getItem("cleaNote_isLoggedIn") === "true"
    setIsLoggedIn(loggedInStatus)
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    localStorage.setItem("cleaNote_isLoggedIn", "true")
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.setItem("cleaNote_isLoggedIn", "false")
    setIsLoggedIn(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-purple-500 text-2xl font-bold animate-pulse">CN</div>
      </div>
    )
  }

  return isLoggedIn ? <NoteApp onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} />
}
