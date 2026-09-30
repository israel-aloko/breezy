import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import TaskCard from '../components/TaskCard'
import TaskFormModal from '../components/TaskFormModal'
import TaskDetailModal from '../components/TaskDetailModal'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const COLUMNS = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
]

export default function TaskBoard({ project }) {
    const currentUserId = useSelector(state => state.auth.userId)

    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [selectedTaskId, setSelectedTaskId] = useState(null)

    const fetchTasks = async () => {
        if (!project?._id) return
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${project._id}/tasks`, { credentials: 'include' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks')
            setTasks(data.tasks)
        } catch (error) {
            console.log('Error fetching tasks', error)
            toast.error(error.message || "Couldn't load the board.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!project?._id) return
        fetchTasks()
    }, [project?._id])

    const myMembership = project?.members.find(m => m.user._id === currentUserId)
    const isAdmin = myMembership?.role === 'admin'

    const tasksByStatus = (statusKey) => tasks.filter((task) => task.status === statusKey)

    // Derived from the latest fetched tasks, so it never goes stale
    const selectedTask = selectedTaskId
        ? tasks.find((t) => t._id === selectedTaskId) || null
        : null

    if (!project) {
        return <div className="p-8 text-center text-stone-500">Project not found.</div>
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4 gap-4">
                <h2 className="text-lg font-semibold text-stone-900">Board</h2>

                {isAdmin && (
                    <button
                        onClick={() => { setEditingTask(null); setShowTaskForm(true) }}
                        disabled={project.status === 'completed'}
                        title={project.status === 'completed' ? 'This project has been completed. Reopen it to add new tasks.' : ''}
                        className="cursor-pointer flex-shrink-0 bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-800 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-green-700"
                    >
                        + New Task
                    </button>
                )}
            </div>

            {loading && tasks.length === 0 ? (
                <div className="p-8 text-center text-stone-500">Loading board...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {COLUMNS.map((column) => (
                        <div key={column.key} className="bg-stone-50 rounded-lg p-3">
                            <h2 className="text-sm font-semibold text-stone-700 uppercase mb-3 px-1">
                                {column.label} ({tasksByStatus(column.key).length})
                            </h2>

                            <div className="flex flex-col gap-2">
                                {tasksByStatus(column.key).length > 0 ? (
                                    tasksByStatus(column.key).map((task) => (
                                        <TaskCard
                                            key={task._id}
                                            task={task}
                                            isAdmin={isAdmin}
                                            currentUserId={currentUserId}
                                            onUpdated={fetchTasks}
                                            onEdit={(t) => { setEditingTask(t); setShowTaskForm(true) }}
                                            onOpen={(t) => setSelectedTaskId(t._id)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-xs text-stone-400 text-center py-6">
                                        No tasks here
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showTaskForm && (
                <TaskFormModal
                    projectId={project._id}
                    members={project.members}
                    task={editingTask}
                    onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
                    onSaved={() => { setShowTaskForm(false); setEditingTask(null); fetchTasks() }}
                />
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    members={project.members}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedTaskId(null)}
                    onUpdated={fetchTasks}
                />
            )}
        </div>
    )
}