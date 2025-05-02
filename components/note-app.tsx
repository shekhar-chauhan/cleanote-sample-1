"use client"

import { useState } from "react"

import type React from "react"

import { useRef, useEffect } from "react"
import { Save, Trash2, Menu, X, User, LogOut, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "../context/user-context"
import { useDrive } from "../context/drive-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function NoteApp() {
  const { user, logout } = useUser()
  const {
    notes,
    activeTab,
    isLoading,
    isSyncing,
    syncError,
    setActiveTab,
    addNote,
    updateNote,
    deleteNote,
    saveNoteToFile,
  } = useDrive()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Focus the textarea when the component mounts or when the active tab changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeTab])

  const handleContentChange = (content: string) => {
    updateNote(activeTab, content)
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNote(id)
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
          <div className="text-purple-600 text-2xl font-bold animate-pulse">CN</div>
          <p className="text-sm text-gray-500">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-amber-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
        <header className="flex justify-between items-center p-2 border-b bg-amber-50">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[280px] bg-amber-50 p-0"
                  // Add smooth transition with framer-motion
                  motionProps={{
                    initial: { x: -100, opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: -100, opacity: 0 },
                    transition: { type: "spring", bounce: 0.1, duration: 0.5 },
                  }}
                >
                  <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All Notes</h2>
                    {isSyncing && (
                      <div className="flex items-center text-xs text-gray-500">
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
                              className={`cursor-pointer hover:bg-amber-100 p-2 rounded ${
                                note.id === activeTab ? "bg-amber-100" : ""
                              }`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <button
                                className="w-full text-left"
                                onClick={() => {
                                  setActiveTab(note.id)
                                  setSidebarOpen(false)
                                }}
                              >
                                <div className="font-bold truncate">{firstLine}</div>
                                {previewContent && (
                                  <div className="text-xs text-gray-500 truncate mt-1">{previewContent}</div>
                                )}
                              </button>
                            </motion.li>
                          )
                        })}
                      </ul>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
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
              <TabsList className="bg-amber-50">
                {notes.map((note) => (
                  <TabsTrigger
                    key={note.id}
                    value={note.id}
                    className="px-4 bg-amber-50 data-[state=active]:bg-amber-50 flex items-center gap-1 max-w-[150px]"
                  >
                    <span className="truncate">{getTabTitle(note.content) || "Untitled"}</span>
                    <button onClick={(e) => closeTab(note.id, e)} className="ml-1 rounded-full hover:bg-amber-200 p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </TabsTrigger>
                ))}
                <Button variant="ghost" size="sm" onClick={addNote} className="h-8 px-2 ml-1 bg-amber-50">
                  +
                </Button>
              </TabsList>
            </div>
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => deleteNote(activeTab)} className="mr-2">
                      <Trash2 className="h-5 w-5" />
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
                      className="mr-2 relative"
                    >
                      {isSyncing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
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
              <div className="mr-2 px-2 relative">
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 font-bold text-lg">
                  CN
                </span>
              </div>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user?.picture ? (
                      <img src={user.picture || "/placeholder.svg"} alt={user.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user && (
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {syncError && <div className="bg-red-100 text-red-800 text-sm p-2 text-center">{syncError}</div>}
          {notes.map((note) => (
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
