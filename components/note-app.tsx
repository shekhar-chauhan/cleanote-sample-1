"use client"

import { useState } from "react"

import type React from "react"

import { useRef, useEffect } from "react"
import { Save, Trash2, Menu, X, LogOut, RefreshCw, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "../context/user-context"
import { useDrive } from "../context/drive-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Custom profile avatar component
const ProfileAvatar = ({ user, onClick }) => {
  if (user?.picture) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer"
        onClick={onClick}
      >
        <div className="h-7 w-7 rounded-full overflow-hidden border-2 border-purple-300/30">
          <img src={user.picture || "/placeholder.svg"} alt={user.name} className="h-full w-full object-cover" />
        </div>
        <motion.div
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative cursor-pointer"
      onClick={onClick}
    >
      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
        <PenTool className="h-3 w-3" />
      </div>
      <motion.div
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </motion.div>
  )
}

// CleaNote logo with animation
const CleaNoteLogo = () => {
  return (
    <div className="relative px-2">
      <motion.div
        animate={{
          y: [0, -5, 0],
          boxShadow: [
            "0 0 0 rgba(168, 85, 247, 0.2)",
            "0 0 15px rgba(168, 85, 247, 0.4)",
            "0 0 0 rgba(168, 85, 247, 0.2)",
          ],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
        className="absolute -inset-4 bg-purple-500/10 rounded-full blur-md -z-10"
      />
      <div className="relative">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 font-bold text-lg">
          CN
        </span>
        <motion.span
          className="absolute inset-0 border border-purple-500/30 rounded-md"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
    </div>
  )
}

export default function NoteApp() {
  const { user, logout } = useUser()
  const {
    notes,
    activeTab,
    openTabs, // Add this line
    isLoading,
    isSyncing,
    syncError,
    setActiveTab,
    addNote,
    updateNote,
    deleteNote,
    closeTab, // Add this line
    saveNoteToFile,
  } = useDrive()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openTabsState, setOpenTabs] = useState(openTabs || [])

  // Focus the textarea when the component mounts or when the active tab changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeTab])

  const handleContentChange = (content: string) => {
    updateNote(activeTab, content)
  }

  // Replace the closeTab function with this one that uses the context's closeTab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    closeTab(id) // Use the context's closeTab instead of deleteNote
  }

  const getTabTitle = (content: string) => {
    const firstLine = content.split("\n")[0].trim()
    if (!firstLine) return "Untitled"

    // Truncate based on number of tabs
    const maxLength = Math.max(10, 30 - notes.length * 2)
    return firstLine.length > maxLength ? firstLine.substring(0, maxLength) + "..." : firstLine
  }

  const activeNoteContent = notes.find((note) => note.id === activeTab)?.content || ""

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd

      // Insert tab at cursor position
      const newContent = activeNoteContent.substring(0, start) + "    " + activeNoteContent.substring(end)
      handleContentChange(newContent)

      // Move cursor after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
        }
      }, 0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="text-purple-600 text-2xl font-bold"
          >
            CN
          </motion.div>
          <p className="text-sm text-gray-500">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-amber-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
        <header className="flex justify-between items-center p-2 border-b bg-amber-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2 text-amber-800 hover:bg-amber-100">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] bg-amber-50 p-0"
                  motionProps={{
                    initial: { x: -100, opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: -100, opacity: 0 },
                    transition: { type: "spring", bounce: 0.1, duration: 0.5 },
                  }}
                >
                  <div className="p-4 border-b flex items-center justify-between bg-amber-100/50">
                    <h2 className="text-lg font-semibold text-amber-900">All Notes</h2>
                    {isSyncing && (
                      <div className="flex items-center text-xs text-amber-700">
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        Syncing...
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                      <ul className="space-y-2">
                        {notes.map((note, index) => {
                          const firstLine = note.content.split("\n")[0].trim() || "Untitled"
                          const restContent = note.content.split("\n").slice(1).join("\n").trim()
                          const previewContent =
                            restContent.length > 50 ? restContent.substring(0, 50) + "..." : restContent

                          return (
                            <motion.li
                              key={note.id}
                              className={`cursor-pointer hover:bg-amber-100 p-3 rounded-lg ${
                                note.id === activeTab ? "bg-amber-100 shadow-sm" : ""
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <button
                                className="w-full text-left"
                                onClick={() => {
                                  // If the note is not in openTabs, add it
                                  if (!openTabs.includes(note.id)) {
                                    setOpenTabs([...openTabs, note.id])
                                  }
                                  setActiveTab(note.id)
                                  setSidebarOpen(false)
                                }}
                              >
                                <div className="font-bold truncate text-amber-900">{firstLine}</div>
                                {previewContent && (
                                  <div className="text-xs text-amber-700/70 truncate mt-1">{previewContent}</div>
                                )}
                              </button>
                            </motion.li>
                          )
                        })}
                      </ul>
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-amber-300 text-amber-900 hover:bg-amber-100 hover:text-amber-950"
                        onClick={() => {
                          addNote()
                          setSidebarOpen(false)
                        }}
                      >
                        New Note
                      </Button>
                    </div>
                  </AnimatePresence>
                </SheetContent>
              </Sheet>
              {/* Update the TabsList to only show open tabs */}
              <TabsList className="bg-amber-50 border border-amber-200/50 rounded-lg p-0.5 h-auto">
                {notes
                  .filter((note) => openTabs.includes(note.id))
                  .map((note) => (
                    <TabsTrigger
                      key={note.id}
                      value={note.id}
                      className="px-3 py-1.5 bg-amber-50 data-[state=active]:bg-amber-100 data-[state=active]:shadow-sm flex items-center gap-1 max-w-[150px] rounded-md text-amber-900 h-auto"
                    >
                      <span className="truncate">{getTabTitle(note.content) || "Untitled"}</span>
                      <button
                        onClick={(e) => handleCloseTab(note.id, e)}
                        className="ml-1 rounded-full hover:bg-amber-200 p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </TabsTrigger>
                  ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addNote}
                  className="h-auto px-2 ml-1 bg-amber-50 hover:bg-amber-100 text-amber-900"
                >
                  +
                </Button>
              </TabsList>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(activeTab)}
                      className="text-amber-800 hover:bg-amber-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete note</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete note</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => saveNoteToFile(activeTab)}
                      disabled={!activeNoteContent.trim() || isSyncing}
                      className="text-amber-800 hover:bg-amber-100 relative"
                    >
                      {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {user && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isSyncing ? 1 : 0 }}
                          className="absolute -bottom-1 -right-1 text-[10px] text-purple-500 bg-amber-50 rounded-full px-1"
                        >
                          Auto
                        </motion.span>
                      )}
                      <span className="sr-only">Save note</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {user ? (isSyncing ? "Saving..." : "Save to Google Drive") : "Download as .txt"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* CleaNote Logo with bouncing animation */}
              <CleaNoteLogo />

              {/* Profile dropdown with custom avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="ml-1">
                    <ProfileAvatar user={user} onClick={() => {}} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-amber-50 border-amber-200">
                  {user && (
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium text-amber-900">{user.name}</div>
                      <div className="text-xs text-amber-700/70">{user.email}</div>
                    </div>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-amber-900 focus:bg-amber-100">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Update the TabsContent to only render open tabs */}
        <main className="flex-1 overflow-hidden">
          {syncError && <div className="bg-red-100 text-red-800 text-sm p-2 text-center">{syncError}</div>}
          {notes
            .filter((note) => openTabs.includes(note.id))
            .map((note) => (
              <TabsContent key={note.id} value={note.id} className="h-full p-0 m-0">
                <div className="relative h-full bg-amber-50">
                  <textarea
                    ref={note.id === activeTab ? textareaRef : null}
                    value={note.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
                    placeholder="Start typing..."
                    style={{ caretColor: "#000" }}
                  />
                </div>
              </TabsContent>
            ))}
        </main>
      </Tabs>
    </div>
  )
}
