import React, { useEffect, useMemo, useRef } from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COLUMNS = [
    { key: 'todo', label: 'To Do' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
];

const PRIORITY_STYLES = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
};

const DAY_MS = 24 * 60 * 60 * 1000

const isTaskOverdue = (task) =>
    task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()

const matchesDue = (task, dueFilter) => {
    if (dueFilter === 'all') return true
    if (dueFilter === 'none') return !task.deadline
    if (!task.deadline) return false
    if (dueFilter === 'overdue') return isTaskOverdue(task)
    if (dueFilter === 'week') {
        const now = new Date()
        const deadline = new Date(task.deadline)
        return task.status !== 'done' && deadline >= now && deadline <= new Date(now.getTime() + 7 * DAY_MS)
    }
    return true
}

const formatDeadline = (deadline) =>
    deadline ? new Date(deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null

const DEFAULT_FILTERS = { project: 'all', priority: 'all', due: 'all', status: 'all' };

export default function TasksDashboard() {
    const currentUserId = useSelector((state) => state.auth.userId)

    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('board')
    const [filters, setFilters] = useState(DEFAULT_FILTERS)
    const [updatingId, setUpdatingId] = useState(null)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedMembers, setSelectedMembers] = useState([])

    const membersCache = useRef({});

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/mine`, { credentials: 'include' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks')
            setTasks(data.tasks)
        } catch (error) {
            console.log('Error fetching my tasks', error)
            toast.error(error.message || "Couldn't load your tasks.")
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchTasks()
    }, [])

    const openTask = async (task) => {
        const projectId = task.project?._id
        if (projectId && !membersCache.current[projectId]) {
            try {
                const res = await fetch(`${BASE_URL}/api/projects/${projectId}`, { credentials: 'include' })
                const data = await res.json()
                if (!res.ok) throw new Error(data.message)
                membersCache.current[projectId] = (data.project || data).members || []
            } catch (error) {
                console.log('Could not load project members', error)
            }
        }
        setSelectedMembers(membersCache.current[projectId] || [])
        setSelectedTask(task)
    }

    const changeStatus = async (taskId, status) => {
        setUpdatingId(taskId)
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to update status')
            toast.success('Status updated')
            await fetchTasks()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUpdatingId(null)
        }
    }

    const setFilter = (key) => (e) => setFilters((prev) => ({ ...prev, [key]: e.target.value }))
    const filtersActive = Object.keys(DEFAULT_FILTERS).some((k) => filters[k] !== DEFAULT_FILTERS[k])

    const projectOptions = useMemo(() => {
        const seen = new Map()
        tasks.forEach((t) => {
            if (t.project?._id) seen.set(t.project._id, t.project.name)
        })
        return [...seen.entries()].map(([id, name]) => ({ id, name }))
    }, [tasks])

    const filteredTasks = tasks.filter((t) => {
        if (filters.project !== 'all' && t.project?._id !== filters.project) return false
        if (filters.priority !== 'all' && t.priority !== filters.priority) return false
        if (!matchesDue(t, filters.due)) return false
        // Status filter only applies to the list; the board already splits by status.
        if (view === 'list' && filters.status !== 'all' && t.status !== filters.status) return false
        return true
    })

    const stats = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        overdue: tasks.filter(isTaskOverdue).length,
    }

    const selectClass =
        'cursor-pointer border border-gray-200 rounded-lg px-3 py-2 text-sm text-stone-600 bg-white'

    const renderBoard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COLUMNS.map((column) => {
                const columnTasks = filteredTasks.filter((t) => t.status === column.key)
                return (
                    <div key={column.key} className="bg-stone-50 rounded-lg p-3">
                        <h2 className="text-sm font-semibold text-stone-700 uppercase mb-3 px-1">
                            {column.label} ({columnTasks.length})
                        </h2>
                        <div className="flex flex-col gap-2">
                            {columnTasks.length > 0 ? (
                                columnTasks.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        showProject
                                        isAdmin={false}
                                        currentUserId={currentUserId}
                                        onUpdated={fetchTasks}
                                        onEdit={() => { }}
                                        onOpen={openTask}
                                    />
                                ))
                            ) : (
                                <div className="text-xs text-stone-400 text-center py-6">No tasks here</div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )

    const renderList = () => (
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm divide-y divide-gray-100">
            {filteredTasks.map((task) => {
                const overdue = isTaskOverdue(task)
                const deadlineLabel = formatDeadline(task.deadline)
                return (
                    <div
                        key={task._id}
                        onClick={() => openTask(task)}
                        className="cursor-pointer flex flex-col md:flex-row md:items-center gap-2 md:gap-4 px-4 py-3 hover:bg-stone-50 transition"
                    >
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                                {task.title}
                            </p>
                            <p className="text-xs text-stone-500 truncate">{task.project?.name || 'Unknown project'}</p>
                        </div>

                        <span className={`self-start md:self-auto text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority}
                        </span>

                        <span className={`text-xs w-24 ${overdue ? 'text-red-600 font-medium' : 'text-stone-500'}`}>
                            {deadlineLabel ? `${overdue ? 'Overdue: ' : ''}${deadlineLabel}` : 'No deadline'}
                        </span>

                        <select
                            value={task.status}
                            onChange={(e) => changeStatus(task._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updatingId === task._id}
                            className="cursor-pointer text-xs border border-gray-200 rounded-md px-2 py-1.5 text-stone-600 disabled:opacity-50"
                        >
                            {COLUMNS.map((c) => (
                                <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                )
            })}
        </div>
    )

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-semibold">My Tasks</h1>

                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                    {['board', 'list'].map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`cursor-pointer px-4 py-2 capitalize transition ${view === v ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Assigned to me', value: stats.total, tone: 'text-stone-900' },
                    { label: 'To do', value: stats.todo, tone: 'text-stone-900' },
                    { label: 'In progress', value: stats.inProgress, tone: 'text-stone-900' },
                    { label: 'Overdue', value: stats.overdue, tone: stats.overdue > 0 ? 'text-red-600' : 'text-stone-900' },
                ].map((s) => (
                    <div key={s.label} className="bg-white border border-gray-100 rounded-lg shadow-sm px-4 py-3">
                        <p className={`text-2xl font-semibold ${s.tone}`}>{s.value}</p>
                        <p className="text-xs text-stone-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <select value={filters.project} onChange={setFilter('project')} className={selectClass}>
                    <option value="all">All projects</option>
                    {projectOptions.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <select value={filters.priority} onChange={setFilter('priority')} className={selectClass}>
                    <option value="all">Any priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select value={filters.due} onChange={setFilter('due')} className={selectClass}>
                    <option value="all">Any due date</option>
                    <option value="overdue">Overdue</option>
                    <option value="week">Due this week</option>
                    <option value="none">No deadline</option>
                </select>

                {view === 'list' && (
                    <select value={filters.status} onChange={setFilter('status')} className={selectClass}>
                        <option value="all">Any status</option>
                        {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                    </select>
                )}

                {filtersActive && (
                    <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="cursor-pointer text-sm font-medium text-stone-500 hover:text-stone-700 px-2 py-2"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {loading ? (
                <div className="p-8 text-center text-stone-500">Loading your tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="p-8 text-center text-stone-500">
                    No tasks are assigned to you yet. When a project admin assigns you one, it will show up here.
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-stone-500">No tasks match these filters.</div>
            ) : view === 'board' ? (
                renderBoard()
            ) : (
                renderList()
            )}

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    members={selectedMembers}
                    currentUserId={currentUserId}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    )
}
