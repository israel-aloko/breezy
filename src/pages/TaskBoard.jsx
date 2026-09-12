import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import TaskCard from '../components/TaskCard'
import TaskFormModal from '../components/TaskFormModal'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const COLUMNS = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
]

export default function ProjectBoard() {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUserId = useSelector(state => state.auth.userId)

    const [project, setProject] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [editingTask, setEditingTask] = useState(null)

    // Fetches project (for name, header, and the members list the
    // TaskFormModal needs for its assignee dropdown) and tasks in parallel.
    const fetchBoardData = async () => {
        setLoading(true)
        toast.loading('Loading board...', { id: 'board' })
        try {
            const [projectRes, tasksRes] = await Promise.all([
                fetch(`${BASE_URL}/api/projects/${id}`, { credentials: 'include' }),
                fetch(`${BASE_URL}/api/projects/${id}/tasks`, { credentials: 'include' }),
            ])

            const projectData = await projectRes.json()
            const tasksData = await tasksRes.json()

            if (!projectRes.ok) {
                throw new Error(projectData.message || 'Failed to fetch project')
            }
            if (!tasksRes.ok) {
                throw new Error(tasksData.message || 'Failed to fetch tasks')
            }

            setProject(projectData.project)
            setTasks(tasksData.tasks)
            toast.dismiss('board')
        } catch (error) {
            console.log('Error fetching board data', error)
            toast.error(error.message || "Couldn't load the board.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBoardData()
    }, [id])

    const myMembership = project?.members.find(m => m.user._id === currentUserId)
    const isAdmin = myMembership?.role === 'admin'

    const tasksByStatus = (statusKey) => tasks.filter((task) => task.status === statusKey)

    if (loading && !project) {
        return <div className="p-8 text-center text-stone-500">Loading board...</div>
    }

    if (!project) {
        return <div className="p-8 text-center text-stone-500">Project not found.</div>
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto mt-20">

            <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                    <button
                        onClick={() => navigate(`/projects/${id}`)}
                        className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700 transition mb-1"
                    >
                        ← Back to project
                    </button>
                    <h1 className="text-2xl font-semibold text-stone-900">{project.name} — Board</h1>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => { setEditingTask(null); setShowTaskForm(true) }}
                        className="cursor-pointer flex-shrink-0 bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-800 transition shadow-sm"
                    >
                        + New Task
                    </button>
                )}
            </div>

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
                                        onUpdated={fetchBoardData}
                                        onEdit={(t) => { setEditingTask(t); setShowTaskForm(true) }}
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

            {showTaskForm && (
                <TaskFormModal
                    projectId={project._id}
                    members={project.members}
                    task={editingTask}
                    onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
                    onSaved={() => { setShowTaskForm(false); setEditingTask(null); fetchBoardData() }}
                />
            )}
        </div>
    )
}