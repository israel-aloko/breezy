import React, { useRef, useState } from 'react'

export default function CommentComposer({ members, onSubmit, onCancel, submitLabel = 'Comment', placeholder = 'Write a comment...' }) {
    const [content, setContent] = useState('');
    const [mentioned, setMentioned] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef(null);

    const filteredMembers = members.filter((m) =>
        m.user.fullname.toLowerCase().includes(mentionQuery.toLowerCase())
    )

    const handleChange = (e) => {
        const value = e.target.value
        setContent(value)

        //detect an in-progress "@word" right before the cursor to drive the suggestion dropdown.
        const cursorPos = e.target.selectionStart
        const textBeforeCursor = value.slice(0, cursorPos)
        const match = textBeforeCursor.match(/@(\w*)$/)

        if (match) {
            setMentionQuery(match[1])
            setShowSuggestions(true)
        } else {
            setShowSuggestions(false)
        }
    }

    const selectMention = (member) => {
        const cursorPos = textareaRef.current.selectionStart
        const textBeforeCursor = content.slice(0, cursorPos)
        const textAfterCursor = content.slice(cursorPos)
        const newTextBefore = textBeforeCursor.replace(/@(\w*)$/, `@${member.user.fullname}`)

        setContent(newTextBefore + textAfterCursor)
        setMentioned((prev) =>
            prev.some((m) => m._id === member.user._id) ? prev : [...prev, member.user]
        )
        setShowSuggestions(false)
        textareaRef.current.focus()
    }

    const handleSubmit = async () => {
        if (!content.trim()) return
        setSubmitting(true)
        try {
            await onSubmit({
                content: content.trim(),
                mentions: mentioned.map((m) => m._id),
            })
            setContent('')
            setMentioned([])
        } finally {
            setSubmitting(false)
        }
    }

    return (

        <div className="relative">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                placeholder={placeholder}
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-stone-700 resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
            />

            {showSuggestions && filteredMembers.length > 0 && (
                <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredMembers.map((m) => (
                        <button
                            key={m.user._id}
                            type="button"
                            onClick={() => selectMention(m)}
                            className="cursor-pointer w-full text-left px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
                            {m.user.fullname}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-1.5">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700 transition px-2 py-1"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    className="cursor-pointer bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-800 transition disabled:opacity-50"
                >
                    {submitting ? 'Posting...' : submitLabel}
                </button>
            </div>
        </div>
    )
}
