import React, { useState } from 'react'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function TaskFormModal({ projectId, members, task, onClose, onSaved }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [deadline, setDeadline] = useState(task?.deadline ? task.deadline.slice(0, 10) : '');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Title is required.')
            return
        }

        setSubmitting(true)
        try {
            const url = task
                ?  `${BASE_URL}/api/tasks/${task._id}`
                : `${BASE_URL}/api/projects/${projectId}/tasks`
            const method = task ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || undefined,
                    assignedTo: assignedTo || undefined,
                    priority,
                    deadline: deadline || undefined,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || `Failed to ${task ? 'update' : 'create'} task`)
            }

            toast.success(task ? 'Task update' : 'Task created')
            onSaved()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }

        // setSubmitting(true)
        // try {
        //     c
        //     const res = await fetch(`${BASE_URL}/api/projects/${projectId}/tasks`, {
        //         method: 'POST',
        //         credentials: 'include',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({
        //             title: title.trim(),
        //             description: description.trim() || undefined,
        //             assignedTo: assignedTo || undefined,
        //             priority,
        //             deadline: deadline || undefined,
        //         }),
        //     })

        //     const data = await res.json()

        //     if (!res.ok) {
        //         throw new Error(data.message || 'Failed to create task')
        //     }

        //     toast.success('Task created')
        //     onSaved()
        // } catch (error) {
        //     toast.error(error.message)
        // } finally {
        //     setSubmitting(false)
        // }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-stone-900">New Task</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-stone-400 hover:text-stone-600 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Set up CI pipeline"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional details..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Assign to</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.user._id} value={member.user._id}>
                                    {member.user.fullname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Deadline</label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="cursor-pointer px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50"
                    >
                        {submitting ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    )
}