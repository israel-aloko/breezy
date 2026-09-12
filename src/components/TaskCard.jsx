import React, { useState } from 'react'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_OPTIONS = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
]

const PRIORITY_STYLES = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
}

export default function TaskCard({ task, isAdmin, currentUserId, onUpdated, onEdit }) {
    const [updating, setUpdating] = useState(false)

    const isAssignee = task.assignedTo && task.assignedTo._id === currentUserId
    const isUnassigned = !task.assignedTo
    // Matches the backend rule exactly: the assignee owns status. If nobody
    // is assigned yet, an admin can still move it since there's no assignee to.
    const canChangeStatus = isAssignee || (isUnassigned && isAdmin)

    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : null

    const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value
        setUpdating(true)
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${task._id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update status')
            }

            toast.success('Status updated')
            onUpdated()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-medium text-stone-800">{task.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => onEdit(task)}
                            className="cursor-pointer text-xs font-medium text-stone-400 hover:text-green-700 transition"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {task.description && (
                <p className="text-xs text-stone-500 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span>
                    {task.assignedTo ? task.assignedTo.fullname : (
                        <span className="italic text-stone-400">Unassigned</span>
                    )}
                </span>

                {formattedDeadline && (
                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {isOverdue ? 'Overdue: ' : ''}{formattedDeadline}
                    </span>
                )}
            </div>

            {canChangeStatus && (
                <select
                    value={task.status}
                    onChange={handleStatusChange}
                    disabled={updating}
                    className="cursor-pointer w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 text-stone-600 disabled:opacity-50"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    )
}