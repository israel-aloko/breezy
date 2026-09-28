import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_LABELS = {
    todo: 'To do',
    'in-progress': 'In progress',
    done: 'Done',
};

const STATUS_STYLES = {
    todo: 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    done: 'bg-green-100 text-green-700',
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${BASE_URL}/api/dashboard`, {
                    credentials: 'include',
                })
                if (!res.ok) throw new Error('Failed to load dashboard')
                const json = await res.json()
                setData(json) 
            } catch (error) {
                toast.error("Couldn't load your dashboard")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    const stats = data?.taskStats
    const overdueCount = data?.overdueCount ?? 0
    const overdueTasks = data?.overdueTasks ?? []
    const projectProgress = data?.projectProgress ?? []

  return (
     <div className="p-4 md:p-8 bg-[#faf7f0]">
            <div className="p-4 md:p-8 pt-20 max-w-7xl mx-auto">

                <div className="mb-6 md:mb-8">
                    <p className="text-xs font-semibold text-green-700 uppercase mb-1">Overview</p>
                    <h1 className="text-2xl font-bold text-green-950">Dashboard</h1>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-green-900/10 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">My tasks</p>
                        <p className="text-2xl font-bold text-green-950">
                            {loading ? '—' : stats?.total ?? 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-900/10 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">In progress</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {loading ? '—' : stats?.['in-progress'] ?? 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-900/10 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Done</p>
                        <p className="text-2xl font-bold text-green-700">
                            {loading ? '—' : stats?.done ?? 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-green-900/10 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Overdue</p>
                        <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-green-950'}`}>
                            {loading ? '—' : overdueCount}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Project progress */}
                    <div className="bg-white rounded-xl border border-green-900/10 overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-green-950">Project progress</h2>
                            <Link to="/projects" className="text-sm font-medium text-green-700 hover:text-green-900 flex items-center gap-1 transition">
                                View all <FiArrowRight size={14} />
                            </Link>
                        </div>

                        {loading ? (
                            <p className="p-6 text-center text-gray-400 text-sm">Loading…</p>
                        ) : projectProgress.length === 0 ? (
                            <p className="p-6 text-center text-gray-400 text-sm">You're not on any projects yet.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {projectProgress.map((project) => (
                                    <Link
                                        key={project.projectId}
                                        to={`/projects/${project.projectId}`}
                                        className="block px-5 py-3 hover:bg-gray-50/60 transition"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-800 truncate">{project.name}</p>
                                            <span className="text-xs font-mono text-gray-500 flex-shrink-0 ml-2">
                                                {project.completedTasks}/{project.totalTasks}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{ width: `${project.percent}%` }}
                                            />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Overdue tasks */}
                    <div className="bg-white rounded-xl border border-green-900/10 overflow-hidden">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                            <h2 className="font-semibold text-green-950">Overdue tasks</h2>
                            <Link to="/tasks/mine" className="text-sm font-medium text-green-700 hover:text-green-900 flex items-center gap-1 transition">
                                View all <FiArrowRight size={14} />
                            </Link>
                        </div>

                        {loading ? (
                            <p className="p-6 text-center text-gray-400 text-sm">Loading…</p>
                        ) : overdueTasks.length === 0 ? (
                            <p className="p-6 text-center text-gray-400 text-sm">Nothing overdue. You're on track.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {overdueTasks.map((task) => (
                                    <div key={task._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition">
                                        <div className="min-w-0 flex items-center gap-2">
                                            <FiAlertTriangle className="text-red-500 flex-shrink-0" size={14} />
                                            <p className="text-sm font-medium text-gray-800 truncate">{task.title ?? 'Untitled task'}</p>
                                        </div>
                                        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[task.status]}`}>
                                            {STATUS_LABELS[task.status]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
  )
}
