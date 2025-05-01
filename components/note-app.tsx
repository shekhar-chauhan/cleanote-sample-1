"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Save, Trash2, Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

interface Note {
  id: string
  content: string
}

interface NoteAppProps {
  onLogout: () => void
}

export default function NoteApp({ onLogout }: NoteAppProps) {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem("notes")
      return savedNotes ? JSON.parse(savedNotes) : [{ id: "note-1", content: "" }]
    }
    return [{ id: "note-1", content: "" }]
  })

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("activeTab")
      return savedTab || "note-1"
    }
    return "note-1"
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Focus the textarea when the component mounts or when the active tab changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [activeTab])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  const handleContentChange = (content: string) => {
    setNotes(notes.map((note) => (note.id === activeTab ? { ...note, content } : note)))
  }

  const addNewTab = () => {
    const newId = `note-${Date.now()}`
    setNotes([...notes, { id: newId, content: "" }])
    setActiveTab(newId)
  }

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (notes.length === 1) {
      // Don't close the last tab, just clear it
      setNotes([{ id: notes[0].id, content: "" }])
      return
    }

    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)

    // If we're closing the active tab, switch to another tab
    if (activeTab === id) {
      setActiveTab(newNotes[0].id)
    }
  }

  const deleteNote = () => {
    if (notes.length === 1) {
      // If it's the last note, just clear it
      setNotes([{ id: notes[0].id, content: "" }])
    } else {
      const newNotes = notes.filter((note) => note.id !== activeTab)
      setNotes(newNotes)
      setActiveTab(newNotes[0].id)
    }
  }

  const saveNote = () => {
    const activeNote = notes.find((note) => note.id === activeTab)
    if (!activeNote || !activeNote.content.trim()) return

    const blob = new Blob([activeNote.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${getTabTitle(activeNote.content)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                  className="w-[250px] bg-amber-50 p-0"
                  // Add smooth transition with framer-motion
                  motionProps={{
                    initial: { x: -100, opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: -100, opacity: 0 },
                    transition: { type: "spring", bounce: 0.1, duration: 0.5 },
                  }}
                >
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">All Notes</h2>
                  </div>
                  <AnimatePresence>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {notes.map((note, index) => (
                          <motion.li
                            key={note.id}
                            className="cursor-pointer hover:bg-amber-100 p-2 rounded"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <button
                              className="w-full text-left truncate"
                              onClick={() => {
                                setActiveTab(note.id)
                                setSidebarOpen(false)
                              }}
                            >
                              {getTabTitle(note.content) || "Untitled"}
                            </button>
                          </motion.li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => {
                          addNewTab()
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
                <Button variant="ghost" size="sm" onClick={addNewTab} className="h-8 px-2 ml-1 bg-amber-50">
                  +
                </Button>
              </TabsList>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={deleteNote} className="mr-2">
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete note</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={saveNote}
                disabled={!activeNoteContent.trim()}
                className="mr-2"
              >
                <Save className="h-5 w-5" />
                <span className="sr-only">Save note</span>
              </Button>

              {/* CleaNote Logo */}
              <div className="mr-2 px-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400 font-bold text-lg">
                CN
              </div>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
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
