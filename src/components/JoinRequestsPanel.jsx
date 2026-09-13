import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function JoinRequestsPanel({ projectId, onMemberAdded }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actingOnId, setActingOnId] = useState(null)

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${projectId}/join-requests`, {
                credentials: 'include',
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch join requests')
            }

            setRequests(data.joinRequests)
        } catch (error) {
            toast.error(error.message || "Couldn't load join requests.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [projectId])

    const respond = async (reqId, action, fullname) => {
        setActingOnId(reqId)
        try {
            const res = await fetch(
                ` ${BASE_URL}/api/projects/${projectId}/join-requests/${reqId}/${action}`,
                { method: 'POST', credentials: 'include' }
            )
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || `Failed to ${action} request`)
            }

            if (action === 'approve') {
                toast.success(`${fullname} added to the project`)
                onMemberAdded?.()
            } else {
                toast.success(`Request from ${fullname} rejected`)
            }

            setRequests((prev) => prev.filter((r) => r._id !== reqId))
        } catch (error) {
            toast.error(error.message)
        } finally {
            setActingOnId(null)
        }
    }

    return (
        <div className="mb-6 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Join requests</h3>
            <p className="text-xs text-stone-500 mb-3">
                People who used your join code are waiting here until you approve or reject them.
            </p>

            {loading ? (
                <p className="text-sm text-stone-400">Loading...</p>
            ) : requests.length === 0 ? (
                <p className="text-sm text-stone-400 italic">No pending requests right now.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {requests.map((request) => {
                        const isActing = actingOnId === request._id
                        return (
                            <div
                                key={request._id}
                                className="flex items-center justify-between p-3 rounded-lg border border-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium text-stone-800">
                                        {request.user.fullname}
                                    </p>
                                    <p className="text-xs text-stone-500">{request.user.email}</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Wants to join this project</p>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => respond(request._id, 'reject', request.user.fullname)}
                                        disabled={isActing}
                                        className="cursor-pointer px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => respond(request._id, 'approve', request.user.fullname)}
                                        disabled={isActing}
                                        className="cursor-pointer px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition disabled:opacity-50"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
