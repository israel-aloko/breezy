import React, { useState } from 'react'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function JoinWithCodeModal({ onClose }) {
    const [code, setCode] = useState('')
    const [looking, setLooking] = useState(false)
    const [preview, setPreview] = useState(null) // { project, alreadyMember, hasPendingRequest }
    const [requesting, setRequesting] = useState(false)

    const handleLookup = async (e) => {
        e.preventDefault()

        if (!code.trim()) {
            toast.error('Enter a join code first.')
            return
        }

        setLooking(true)
        setPreview(null)
        try {
            const res = await fetch(
                `${BASE_URL}/api/projects/lookup?code=${encodeURIComponent(code.trim())}`,
                { credentials: 'include' }
            )
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to look up join code')
            }

            setPreview(data)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLooking(false)
        }
    }

    const handleRequestToJoin = async () => {
        setRequesting(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/join`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ joinCode: code.trim() }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit join request')
            }

            toast.success('Request sent. The project admin needs to approve it before you can access the project.')
            onClose()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setRequesting(false)
        }
    }

    const resetSearch = () => {
        setPreview(null)
        setCode('')
    }

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-green-700/70"
    const labelClass = "block text-xs font-medium text-[#00242b] uppercase mb-1"

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md border border-green-900/10">

                <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold">Join with a code</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer">&times;</button>
                </div>

                {!preview ? (
                    <form onSubmit={handleLookup} className="px-6 py-4 space-y-4">
                        <div>
                            <label className={labelClass}>Join code *</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={inputClass}
                                placeholder="ABC123"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ask a project admin for their join code.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={looking}
                                className="px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 transition shadow-sm cursor-pointer"
                            >
                                {looking ? 'Looking up...' : 'Look up code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="px-6 py-4 space-y-4">
                        <div className="p-3 rounded-lg border border-gray-100">
                            <p className="text-sm font-semibold text-stone-800">{preview.project.name}</p>
                            {preview.project.description && (
                                <p className="text-xs text-stone-500 mt-1">{preview.project.description}</p>
                            )}
                            <p className="text-xs text-stone-400 mt-2">
                                {preview.project.memberCount} member{preview.project.memberCount === 1 ? '' : 's'}
                            </p>
                        </div>

                        {preview.alreadyMember ? (
                            <p className="text-sm text-stone-500">You're already a member of this project.</p>
                        ) : preview.hasPendingRequest ? (
                            <p className="text-sm text-amber-600">
                                You already have a pending request to join this project. Sit tight for admin approval.
                            </p>
                        ) : (
                            <p className="text-xs text-stone-500">
                                Requesting to join sends this to the project admin for approval — you won't have access until they approve it.
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetSearch}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Try another code
                            </button>
                            {!preview.alreadyMember && !preview.hasPendingRequest && (
                                <button
                                    type="button"
                                    onClick={handleRequestToJoin}
                                    disabled={requesting}
                                    className="px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 transition shadow-sm cursor-pointer"
                                >
                                    {requesting ? 'Sending...' : 'Request to join'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}