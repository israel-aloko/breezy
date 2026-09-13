import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function JoinCodeCard({ projectId }) {
    const [joinCode, setJoinCode] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

    const fetchJoinCode = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/join-code`, {
                credentials: 'include',
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch join code')
            }

            setJoinCode(data.joinCode)
        } catch (error) {
            toast.error(error.message || "Couldn't load the join code.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJoinCode()
    }, [projectId])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(joinCode)
            toast.success('Join code copied')
        } catch {
            toast.error('Could not copy - try selecting it manually.')
        }
    }

    const regenerateCode = async () => {
        setRegenerating(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/regenerate-code`, {
                method: 'POST',
                credentials: 'include',
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to regenerate join code.')
            }

            setJoinCode(data.joinCode)
            toast.success('New join code generated. The old code no longer works.')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setRegenerating(false)
        }
    }

    const handleRegenerateClick = () => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-amber-600">This invalidates the current code.</span>
                <span>Anyone with the old code will no longer be able to use it to request access.</span>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); regenerateCode() }}
                        className="cursor-point px-3 py-1 text-sm rounded-lg bg-amber-600 text-white font-semibold">
                        Regenerate
                    </button>
                </div>
            </div>
        ), { duration: 8000 })
    }

    return (
        <div className="mb-6 p-4 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h3 className="text-sm font-semibold text-stone-700">Join code</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        Anyone with this code can request to join. You'll still need to approve them.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {loading ? (
                        <span className="text-sm text-stone-400">Loading...</span>
                    ) : (
                        <>
                            <code className="text-sm font-mono font-semibold tracking-widest bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-stone-800">
                                {joinCode}
                            </code>
                            <button
                                onClick={handleCopy}
                                className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                            >
                                Copy
                            </button>
                            <button
                                onClick={handleRegenerateClick}
                                disabled={regenerating}
                                className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                {regenerating ? 'Regenerating...' : 'Regenerate'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
