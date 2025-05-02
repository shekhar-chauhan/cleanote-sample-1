"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useUser } from "../context/user-context"

// Writing animation component
const WritingAnimation = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-purple-300 h-[1px]"
          style={{
            top: `${Math.random() * 100}%`,
            left: 0,
            width: 0,
          }}
          animate={{
            width: ["0%", "70%", "100%"],
            left: ["0%", "5%", "0%"],
            opacity: [0.3, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  )
}

export default function LoginScreen() {
  const { login, isLoading } = useUser()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoginError(null)
      await login()
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Failed to sign in with Google. Please try again.")
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-4 relative">
      {/* Background writing animation */}
      <WritingAnimation />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 to-transparent opacity-30" />

      <div className="w-full max-w-md mx-auto flex flex-col items-center relative z-10">
        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6,
          }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-6xl font-bold text-white">
              Clea
              <span className="text-purple-500 relative inline-block">
                <span>Note</span>
                {/* Animated border around "Note" */}
                <motion.span
                  className="absolute inset-0 border-2 border-purple-500/50 rounded-lg"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              </span>
            </h1>

            {/* Bouncing purple box animation */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              className="absolute -inset-8 bg-purple-500/20 blur-xl rounded-full -z-10"
            />
          </div>

          {/* Tagline with staggered animation */}
          <div className="text-center mt-2 overflow-hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
              <div className="flex justify-center space-x-3">
                {["Minimal", "Beautiful", "Focused"].map((word, index) => (
                  <motion.span
                    key={word}
                    className="text-purple-300 inline-block"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.7 + index * 0.2,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    {word}
                    {index < 2 && <span className="text-purple-500">.</span>}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Login card with improved animations */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full"
        >
          <div className="backdrop-blur-lg p-8 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20 -z-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 15,
                ease: "linear",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />

            {/* Subtle border glow */}
            <motion.div
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-50 -z-10"
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />

            <motion.h2
              className="text-2xl font-bold text-white mb-6 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Welcome Back
            </motion.h2>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full relative overflow-hidden group border-purple-500/30 hover:border-purple-500 bg-zinc-900/30 text-white hover:text-white hover:bg-zinc-800/50"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </div>
                )}
              </Button>
            </motion.div>

            {loginError && <div className="mt-4 text-red-400 text-sm text-center">{loginError}</div>}

            <motion.div
              className="mt-8 text-center text-xs text-zinc-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              By continuing, you agree to CleaNote's
              <br />
              Terms of Service and Privacy Policy
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-8 text-purple-300/50 text-sm text-center"
        >
          The simplest way to capture your thoughts.
          <br />
          <span className="text-xs mt-2 block text-purple-300/30">Your notes are saved to Google Drive</span>
        </motion.div>
      </div>
    </div>
  )
}
