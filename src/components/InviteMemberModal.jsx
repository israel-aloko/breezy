import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function InviteMemberModal({ projectId, onClose, onSent }) {
    const [mode, setMode] = useState('email');
    const [email, setEmail] = useState('')
    const [sending, setSending] = useState(false)

    //in-app tab, live lookup state
    const [lookupStatus, setLookupStatus] = useState('idle')
    const [lookupName, setLookupName] = useState('')

    useEffect(() => {
        if (mode !== 'inapp' || !email.trim()) {
            setLookupStatus('idle')
            return
        }

        setLookupStatus('checking')

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/users/lookup?email=${encodeURIComponent(email.trim())}`, {
                    credentials: 'include',
                })
                const data = await res.json()

            if (data.exists) {
                    setLookupStatus('found')
                    setLookupName(data.fullname)
                } else {
                    setLookupStatus('not-found')
                }
            } catch {
                setLookupStatus('idle')
            }
        }, 500) //debounce, avoid a request on every keystroke

        return () => clearTimeout(timeout)
    }, [email, mode])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error('An email address is required')
            return
        }

        if (mode === 'inapp' && lookupStatus === 'not-found') {
            toast.error('This email has no account yet - yse "Invite by email" instead, or ask them to sign up first.')
            return
        }

        setSending(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/invites`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send invite')
            }

            toast.success(`Invite sent to ${email.trim()}`)
            onSent()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/70"
    const labelClass = "block text-xs font-medium text-[#00242b] uppercase mb-1"

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md border border-green-900/10">

                <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold">Invite a member</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer">&times;</button>
                </div>

                <div className="flex border-b border-gray-100 px-6">
                    <button
                        type="button"
                        onClick={() => setMode('email')}
                        className={`cursor-pointer px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${mode === 'email'
                                ? 'border-green-700 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Invite by email
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('inapp')}
                        className={`cursor-pointer px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${mode === 'inapp'
                                ? 'border-green-700 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Invite in-app
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className={labelClass}>Email address *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            placeholder="colleague@example.com"
                            required
                        />

                        {mode === 'email' && (
                            <p className="text-xs text-gray-500 mt-1">
                                They'll get an email invite. If they don't have an account yet, they'll be prompted to create one and join automatically.
                            </p>
                        )}

                        {mode === 'inapp' && (
                            <div className="mt-1.5 min-h-[1.25rem]">
                                {lookupStatus === 'checking' && (
                                    <p className="text-xs text-gray-400">Checking...</p>
                                )}
                                {lookupStatus === 'found' && (
                                    <p className="text-xs text-green-700">✓ {lookupName} has an account. They'll get an in-app invite.</p>
                                )}
                                {lookupStatus === 'not-found' && (
                                    <p className="text-xs text-red-500">No account found for this email. Use "Invite by email" instead.</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending || (mode === 'inapp' && lookupStatus === 'not-found')}
                            className="px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 transition shadow-sm cursor-pointer"
                        >
                            {sending ? 'Sending...' : 'Send invite'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
