"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    // Simulate auth delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    onLogin()
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
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
              Clea<span className="text-purple-500">Note</span>
            </h1>
            <div className="absolute -inset-2 bg-purple-500/20 blur-xl rounded-full -z-10"></div>
          </div>
          <p className="text-purple-300 text-center mt-2">Minimal. Beautiful. Focused.</p>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full"
        >
          <div className="bg-zinc-900/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-purple-500/20 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 -z-10"></div>

            <h2 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>

            <div className="space-y-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full relative overflow-hidden group border-purple-500/30 hover:border-purple-500 bg-zinc-900/50 text-white hover:text-white hover:bg-zinc-800"
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
            </div>

            <div className="mt-8 text-center text-xs text-zinc-400">
              By continuing, you agree to CleaNote's
              <br />
              Terms of Service and Privacy Policy
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-purple-300/50 text-sm text-center"
        >
          The simplest way to capture your thoughts.
        </motion.div>
      </div>
    </div>
  )
}
