import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { FaRegComment } from 'react-icons/fa'

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

export default function TaskCard({ task, isAdmin, currentUserId, onUpdated, onEdit, onOpen }) {
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isAssignee = !!task.assignedTo && String(task.assignedTo._id) === String(currentUserId)
    const canChangeStatus = isAssignee
    const isUnassigned = !task.assignedTo


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

    const performDelete = async () => {
        setDeleting(true)
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${task._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete task')
            }

            toast.success('Task deleted')
            onUpdated()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteClick = (e) => {
        e.stopPropagation()

        toast((t) => (
            <div className="flex items-center gap-3">
                <span className="text-sm text-stone-700">
                    Delete <span className="font-medium">"{task.title}"</span>
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id)
                            performDelete()
                        }}
                        className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                        Confirm
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer text-xs font-medium text-stone-400 hover:text-stone-600">
                            Cancel
                    </button>
                </div>
            </div>
        ), {duration: 8000})
    }

    return (
        <div
            onClick={() => onOpen(task)}
            onKeyDown={(e) => { if (e.target === e.currentTarget && e.key === 'Enter') onOpen(task)}}
            role="button"
            tabIndex={0}
            className="group bg-white border border-gray-100 rounded-lg p-3 shadow-sm cursor-pointer hover:border-green-700/40 hover:shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-700/30 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-medium text-stone-800">{task.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                            // onClick={() => onEdit(task)}
                            className="cursor-pointer text-xs font-medium text-stone-400 hover:text-green-700 transition"
                        >
                            Edit
                        </button>
                    )}
                    {isAdmin && (
                        <button
                            onClick={handleDeleteClick}
                            disabled={deleting}
                            className="cursor-pointer text-xs font-medium text-stone-400 hover:text-red-600 transition disabled:opacity-50"
                        >
                            Delete
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
                    onClick={(e) => e.stopPropagation()}
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

            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100 text-xs text-stone-400 group-hover:text-green-700 transition">
                <FaRegComment className="w-3.5 h-3.5"/>
                {task.commentCount > 0
                    ? `${task.commentCount} ${task.commentCount === 1 ? 'Comment' : 'Comments'}`
                    : 'Add comment'}
            </div>
        </div>
    )
}