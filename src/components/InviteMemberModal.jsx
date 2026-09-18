import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import JoinCodeCard from './JoinCodeCard';
import JoinRequestsPanel from './JoinRequestsPanel';

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function InviteMemberModal({ project, isAdmin, onClose, onUpdated }) {
    const [tab, setTab] = useState('invite'); // invite, joincode, requests, members.

    const [mode, setMode] = useState('email');
    const [email, setEmail] = useState('');
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
        }, 500)

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
            const res = await fetch(`${BASE_URL}/api/projects/${project._id}/invites`, {
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
            setEmail('')
            onUpdated()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    const removeMember = async (userId, memberName) => {
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${project._id}/members/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to remove member')
            }

            toast.success(`${memberName} removed from the project`)
            onUpdated()
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRemoveClick = (userId, memberName) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span>Remove {memberName} from this project?</span>
                <div className="flex-gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); removeMember(userId, memberName) }}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg bg-red-600 text-white font-semibold"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ), { duration: 8000 })
    }

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/70"
    const labelClass = "block text-xs font-medium text-[#00242b] uppercase mb-1"

    const tabs = [
        { key: 'invite', label: 'Invite' },
        ...(isAdmin ? [
            { key: 'joincode', label: 'Join Code'},
            { key: 'requests', label: 'Requests' },
        ] : []),
        { key: 'members', label: `Members (${project.members.length})` },
    ]

    return (
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg border border-green-900/10 max-h-[85vh] flex flex-col">

                <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4 flex-shrink-0">
                    <h3 className="text-lg font-semibold">Manage members</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer">&times;</button>
                </div>

                <div className="flex border-b border-gray-100 px-6 flex-shrink-0 overflow-x-auto">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`cursor-pointer whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.key
                                    ? 'border-green-700 text-green-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="px-6 py-4 overflow-y-auto">

                    {tab === 'invite' && (
                        <>
                            <div className="flex border-b border-gray-100 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setMode('email')}
                                    className={`cursor-pointer px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${mode === 'email'
                                            ? 'border-green-700 text-green-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Invite by email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMode('inapp')}
                                    className={`cursor-pointer px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${mode === 'inapp'
                                            ? 'border-green-700 text-green-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Invite in-app
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <button
                                        type="submit"
                                        disabled={sending || (mode === 'inapp' && lookupStatus === 'not-found')}
                                        className="px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 transition shadow-sm cursor-pointer"
                                    >
                                        {sending ? 'Sending...' : 'Send invite'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    {tab === 'joincode' && isAdmin && (
                        <JoinCodeCard projectId={project._id} />
                    )}

                    {tab === 'requests' && isAdmin && (
                        <JoinRequestsPanel projectId={project._id} onMemberAdded={onUpdated} />
                    )}

                    {tab === 'members' && (
                        <div className="flex flex-col gap-2">
                            {project.members.map((member) => (
                                <div
                                    key={member.user._id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-stone-800">{member.user.fullname}</p>
                                        <p className="text-xs text-stone-500">{member.user.email}</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${member.role === 'admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {member.role}
                                        </span>

                                        {isAdmin && member.user._id !== project.owner && (
                                            <button
                                                onClick={() => handleRemoveClick(member.user._id, member.user.fullname)}
                                                className="cursor-pointer text-xs font-medium text-red-500 hover:text-red-700 transition"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
