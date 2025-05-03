"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useUser } from "./user-context"

interface Note {
  id: string
  content: string
  fileId?: string // Google Drive file ID
  lastSynced?: number
}

interface DriveContextType {
  notes: Note[]
  activeTab: string
  openTabs: string[]
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  setActiveTab: (id: string) => void
  addNote: () => void
  updateNote: (id: string, content: string) => void
  deleteNote: (id: string, deleteFromDrive?: boolean) => void
  saveNoteToFile: (id: string) => Promise<void>
  closeTab: (id: string) => void
  openTab: (id: string) => void
}

const DriveContext = createContext<DriveContextType | undefined>(undefined)

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshAccessToken } = useUser()
  const [notes, setNotes] = useState<Note[]>([{ id: "note-1", content: "" }])
  const [activeTab, setActiveTab] = useState("note-1")
  const [openTabs, setOpenTabs] = useState<string[]>(["note-1"])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [folderId, setFolderId] = useState<string | null>(null)

  // Load notes from localStorage when not logged in
  useEffect(() => {
    if (!user) {
      try {
        const savedNotes = localStorage.getItem("notes")
        const savedTab = localStorage.getItem("activeTab")
        const savedOpenTabs = localStorage.getItem("openTabs")

        if (savedNotes) {
          setNotes(JSON.parse(savedNotes))
        }

        if (savedOpenTabs) {
          setOpenTabs(JSON.parse(savedOpenTabs))
        } else if (savedTab) {
          // If no saved open tabs but we have a saved active tab, use that
          setOpenTabs([savedTab])
        }

        if (savedTab) {
          setActiveTab(savedTab)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading notes from localStorage:", error)
        setIsLoading(false)
      }
    }
  }, [user])

  // Save open tabs to localStorage
  useEffect(() => {
    localStorage.setItem("openTabs", JSON.stringify(openTabs))
  }, [openTabs])

  // Load notes from Google Drive when logged in
  useEffect(() => {
    if (user) {
      loadNotesFromDrive()
    }
  }, [user])

  // Save notes to localStorage when not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem("notes", JSON.stringify(notes))
    }
  }, [notes, user])

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  // Auto-save notes to Google Drive when they change (if logged in)
  useEffect(() => {
    if (!user) return

    const activeNote = notes.find((note) => note.id === activeTab)
    if (!activeNote) return

    // Don't auto-save empty notes
    if (!activeNote.content.trim()) return

    // Don't save too frequently - use a debounce
    const autoSaveTimer = setTimeout(async () => {
      setIsSyncing(true)
      setSyncError(null)

      try {
        const fileId = await saveNoteToDrive(activeNote)

        // Update the note with the file ID
        setNotes(
          notes.map((n) => {
            if (n.id === activeNote.id) {
              return { ...n, fileId, lastSynced: Date.now() }
            }
            return n
          }),
        )
      } catch (error) {
        console.error("Error auto-saving to Drive:", error)
        setSyncError("Failed to auto-save note to Google Drive")
      } finally {
        setIsSyncing(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(autoSaveTimer)
  }, [notes, activeTab, user])

  // Find or create the CleaNote folder in Google Drive
  const findOrCreateFolder = async (accessToken: string): Promise<string> => {
    try {
      // First, check if we already have the folder ID in localStorage
      const storedFolderId = localStorage.getItem("cleaNote_folderId")
      if (storedFolderId) {
        // Verify the folder still exists
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${storedFolderId}?fields=id,name,trashed`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        if (response.ok) {
          const folder = await response.json()
          if (!folder.trashed) {
            return storedFolderId
          }
        }
      }

      // Search for the folder
      const searchResponse = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=name%3D%27cleanote%27%20and%20mimeType%3D%27application/vnd.google-apps.folder%27%20and%20trashed%3Dfalse",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      const searchData = await searchResponse.json()

      if (searchData.files && searchData.files.length > 0) {
        // Folder exists
        const folderId = searchData.files[0].id
        localStorage.setItem("cleaNote_folderId", folderId)
        return folderId
      }

      // Create the folder
      const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "cleanote",
          mimeType: "application/vnd.google-apps.folder",
        }),
      })

      const folder = await createResponse.json()
      localStorage.setItem("cleaNote_folderId", folder.id)
      return folder.id
    } catch (error) {
      console.error("Error finding/creating folder:", error)
      throw new Error("Failed to access Google Drive folder")
    }
  }

  // Load notes from Google Drive
  const loadNotesFromDrive = async () => {
    if (!user) return

    setIsLoading(true)
    setSyncError(null)

    try {
      const accessToken = await refreshAccessToken()
      if (!accessToken) {
        throw new Error("Not authenticated")
      }

      // Find or create the CleaNote folder
      const folderIdValue = await findOrCreateFolder(accessToken)
      setFolderId(folderIdValue)

      // Get all .txt files in the folder
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27text/plain%27%20and%20%27${folderIdValue}%27%20in%20parents%20and%20trashed%3Dfalse&fields=files(id,name)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      const data = await response.json()

      if (!data.files || data.files.length === 0) {
        // No files found, use default note if no notes exist
        if (notes.length === 0) {
          setNotes([{ id: "note-1", content: "" }])
          setOpenTabs(["note-1"])
          setActiveTab("note-1")
        }
        setIsLoading(false)
        return
      }

      // Load content for each file
      const notesPromises = data.files.map(async (file: any) => {
        const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        const content = await contentResponse.text()
        const noteId = file.name.replace(".txt", "")

        return {
          id: noteId,
          content,
          fileId: file.id,
          lastSynced: Date.now(),
        }
      })

      const loadedNotes = await Promise.all(notesPromises)

      if (loadedNotes.length > 0) {
        // Merge loaded notes with existing notes, preferring loaded notes for duplicates
        const mergedNotes = [...notes]

        loadedNotes.forEach((loadedNote) => {
          const existingNoteIndex = mergedNotes.findIndex((n) => n.id === loadedNote.id)
          if (existingNoteIndex >= 0) {
            mergedNotes[existingNoteIndex] = loadedNote
          } else {
            mergedNotes.push(loadedNote)
          }
        })

        setNotes(mergedNotes)

        // If no active tab, set the first loaded note as active
        if (!activeTab || !openTabs.length) {
          setActiveTab(loadedNotes[0].id)
          setOpenTabs([loadedNotes[0].id])
        }
      }
    } catch (error) {
      console.error("Error loading notes from Drive:", error)
      setSyncError("Failed to load notes from Google Drive")

      // Fall back to local storage only if we have no notes
      if (notes.length === 0) {
        const savedNotes = localStorage.getItem("notes")
        const savedTab = localStorage.getItem("activeTab")

        if (savedNotes) {
          setNotes(JSON.parse(savedNotes))
        }

        if (savedTab) {
          setActiveTab(savedTab)
          setOpenTabs([savedTab])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Create or update a file in Google Drive
  const saveNoteToDrive = async (note: Note) => {
    if (!user || !folderId) return null

    try {
      const accessToken = await refreshAccessToken()
      if (!accessToken) {
        throw new Error("Not authenticated")
      }

      // Get the first line for filename
      const firstLine = note.content.split("\n")[0].trim() || "Untitled"
      // Sanitize filename - remove characters that are invalid in filenames
      const sanitizedName = firstLine.replace(/[/\\?%*:|"<>]/g, "").substring(0, 100)
      const fileName = `${sanitizedName}.txt`
      const fileContent = note.content

      if (note.fileId) {
        // Update existing file
        // First update the content
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${note.fileId}?uploadType=media`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "text/plain",
          },
          body: fileContent,
        })

        // Then update the filename if it has changed
        await fetch(`https://www.googleapis.com/drive/v3/files/${note.fileId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fileName,
          }),
        })

        return note.fileId
      } else {
        // Create new file
        const metadata = {
          name: fileName,
          mimeType: "text/plain",
          parents: [folderId],
        }

        // First, create the file metadata
        const metadataResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(metadata),
        })

        const file = await metadataResponse.json()

        // Then, upload the content
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "text/plain",
          },
          body: fileContent,
        })

        return file.id
      }
    } catch (error) {
      console.error("Error saving note to Drive:", error)
      throw error
    }
  }

  // Delete a file from Google Drive
  const deleteNoteFromDrive = async (fileId: string) => {
    if (!user) return

    try {
      const accessToken = await refreshAccessToken()
      if (!accessToken) {
        throw new Error("Not authenticated")
      }

      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      console.error("Error deleting note from Drive:", error)
      throw error
    }
  }

  // Add a new note
  const addNote = () => {
    const newId = `note-${Date.now()}`
    const newNote = { id: newId, content: "" }
    setNotes([...notes, newNote])
    setOpenTabs([...openTabs, newId])
    setActiveTab(newId)
  }

  // Update a note's content
  const updateNote = (id: string, content: string) => {
    setNotes(
      notes.map((note) => {
        if (note.id === id) {
          return { ...note, content }
        }
        return note
      }),
    )
  }

  // Delete a note
  const deleteNote = async (id: string, deleteFromDrive = true) => {
    const noteToDelete = notes.find((note) => note.id === id)

    if (notes.length === 1) {
      // If it's the last note, just clear it
      setNotes([{ id: notes[0].id, content: "" }])
      return
    }

    const newNotes = notes.filter((note) => note.id !== id)
    setNotes(newNotes)

    // Close the tab
    closeTab(id)

    // Delete from Google Drive if logged in and explicitly requested
    if (deleteFromDrive && user && noteToDelete?.fileId) {
      try {
        await deleteNoteFromDrive(noteToDelete.fileId)
      } catch (error) {
        console.error("Failed to delete note from Drive:", error)
      }
    }
  }

  const closeTab = (id: string) => {
    // Don't allow closing the last tab
    if (openTabs.length <= 1) {
      return
    }

    // Remove the tab from openTabs
    const newOpenTabs = openTabs.filter((tabId) => tabId !== id)
    setOpenTabs(newOpenTabs)

    // If we're closing the active tab, switch to another tab
    if (activeTab === id) {
      setActiveTab(newOpenTabs[0])
    }
  }

  // Add a function to open a tab
  const openTab = (id: string) => {
    if (!openTabs.includes(id)) {
      setOpenTabs([...openTabs, id])
    }
    setActiveTab(id)
  }

  // Save a note to a file
  const saveNoteToFile = async (id: string) => {
    const note = notes.find((n) => n.id === id)
    if (!note || !note.content.trim()) return

    if (user) {
      // Save to Google Drive
      setIsSyncing(true)
      setSyncError(null)

      try {
        const fileId = await saveNoteToDrive(note)

        // Update the note with the file ID
        setNotes(
          notes.map((n) => {
            if (n.id === id) {
              return { ...n, fileId, lastSynced: Date.now() }
            }
            return n
          }),
        )
      } catch (error) {
        console.error("Error saving to Drive:", error)
        setSyncError("Failed to save note to Google Drive")
      } finally {
        setIsSyncing(false)
      }
    } else {
      // Save locally
      const firstLine = note.content.split("\n")[0].trim() || "Untitled"
      const sanitizedName = firstLine.replace(/[/\\?%*:|"<>]/g, "").substring(0, 100)

      const blob = new Blob([note.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${sanitizedName}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <DriveContext.Provider
      value={{
        notes,
        activeTab,
        openTabs,
        isLoading,
        isSyncing,
        syncError,
        setActiveTab,
        addNote,
        updateNote,
        deleteNote,
        saveNoteToFile,
        closeTab,
        openTab,
      }}
    >
      {children}
    </DriveContext.Provider>
  )
}

export function useDrive() {
  const context = useContext(DriveContext)
  if (context === undefined) {
    throw new Error("useDrive must be used within a DriveProvider")
  }
  return context
}
