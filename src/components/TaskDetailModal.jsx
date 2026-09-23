import React from 'react'
import CommentThread from './CommentThread'

const PRIORITY_STYLES = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',

}
export default function TaskDetailModal({ task, members, currentUserId, onClose }) {
    const formattedDeadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
                <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-semibold text-stone-900">{task.title}</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                                {task.priority}
                            </span>
                            <span className="text-xs text-stone-500">
                                {task.assignedTo ? task.assignedTo.fullname : 'Unassigned'}
                            </span>
                            {formattedDeadline && (
                                <span className="text-xs text-stone-500">Due {formattedDeadline}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-stone-400 hover:text-stone-600 text-xl leading-none flex-shrink-0"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1">
                    {task.description && (
                        <p className="text-sm text-stone-600 mb-5">{task.description}</p>
                    )}

                    <CommentThread
                        taskId={task._id}
                        members={members}
                        currentUserId={currentUserId}
                    />
                </div>
            </div>
        </div>
    )
}
