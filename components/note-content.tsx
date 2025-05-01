"use client"

import type React from "react"

import { useRef, useEffect } from "react"

interface NoteContentProps {
  content: string
  onChange: (content: string) => void
  isActive: boolean
}

export function NoteContent({ content, onChange, isActive }: NoteContentProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isActive])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd

      // Insert tab at cursor position
      const newContent = content.substring(0, start) + "    " + content.substring(end)
      onChange(newContent)

      // Move cursor after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
        }
      }, 0)
    }
  }

  return (
    <div className="relative h-full bg-amber-50">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 focus:outline-none"
        placeholder="Start typing..."
        style={{ caretColor: "#000" }}
      />
    </div>
  )
}
