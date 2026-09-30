import React, { useEffect, useState } from 'react'
import CommentThread from './CommentThread'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_OPTIONS = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
]
const STATUS_STYLES = {
    todo: 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
}

const PRIORITY_STYLES = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',

}

export default function TaskDetailModal({ task, members, currentUserId, isAdmin, onClose, onUpdated }) {
    const [status, setStatus] = useState(task.status)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        setStatus(task.status)
    }, [task.status])

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    // const isAssignee = task.assignedTo
    // const isUnassigned = !task.assignedTo
    const isAssignee = !!task.assignedTo && String(task.assignedTo._id) === String(currentUserId)
    const canChangeStatus = isAssignee

    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : null

    const isOverdue = task.deadline && status !== 'done' && new Date(task.deadline) < new Date()

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value
        const previous = status
        setStatus(newStatus)
        setUpdating(true)
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${task._id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to update status')

            toast.success('Status updated')
            onUpdated?.()
        } catch (error) {
            setStatus(previous)
            toast.error(error.message)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-stone-900">{task.title}</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-stone-400 hover:text-stone-600 text-xl leading-none flex-shrink-0"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="overflow-y-auto flex-1">

                    <div className="p-5 border-b border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase text-stone-400 mb-1">Status</p>
                                {canChangeStatus ? (
                                    <select
                                        value={status}
                                        onChange={handleStatusChange}
                                        disabled={updating}
                                        className="cursor-pointer w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 text-stone-600 disabled:opacity-50"
                                    >
                                        {STATUS_OPTIONS.map((o) => (
                                            <option key={o.key} value={o.key}>{o.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
                                        {STATUS_OPTIONS.find((o) => o.key === status)?.label}
                                    </span>
                                )}
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase text-stone-400 mb-1">Priority</p>
                                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                                    {task.priority}
                                </span>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase text-stone-400 mb-1">Assignee</p>
                                <p className="text-sm text-stone-700">
                                    {task.assignedTo ? task.assignedTo.fullname : (
                                        <span className="italic text-stone-400">Unassigned</span>
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-[11px] font-semibold uppercase text-stone-400 mb-1">Deadline</p>
                                <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-stone-700'}`}>
                                    {formattedDeadline
                                        ? `${isOverdue ? 'Overdue: ' : ''}${formattedDeadline}`
                                        : <span className="text-stone-400">None</span>}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase text-stone-400 mb-1">Description</p>
                            {task.description ? (
                                <p className="text-sm text-stone-600 whitespace-pre-wrap">{task.description}</p>
                            ) : (
                                <p className="text-sm italic text-stone-400">No description provided.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-5">
                        <CommentThread
                            taskId={task._id}
                            members={members}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
