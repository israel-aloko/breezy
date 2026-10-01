import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const STATUS_COLORS = { todo: '#a8a29e', inProgress: '#0ea5e9', done: '#15803d' }

const PRIORITY_STYLES = {
    high: 'bg-red-50 text-red-700 border-red-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-sky-50 text-sky-700 border-sky-100',
}

function KpiCard({ label, value, hint, accent = 'text-stone-900' }) {
    return (
        <div className="p-4 rounded-lg border border-gray-100 bg-white">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-semibold mt-1 ${accent}`}>{value}</p>
            {hint && <p className="text-xs text-stone-400 mt-1">{hint}</p>}
        </div>
    )
}

function Panel({ title, action, children }) {
    return (
        <div className="p-4 rounded-lg border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    )
}

const shortDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const startOfLocalDay = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
}

const startOfLocalWeek = (d) => {
    const x = startOfLocalDay(d)
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7)) // back to Monday
    return x
}

// Turns the raw completion times into chart bars for the chosen view
const buildBuckets = (completions, mode) => {
    const daily = mode === 'daily'
    const count = daily ? 14 : 8
    const step = daily ? 1 : 7
    const base = daily ? startOfLocalDay(new Date()) : startOfLocalWeek(new Date())

    const buckets = []
    for (let i = count - 1; i >= 0; i--) {
        const start = new Date(base)
        start.setDate(start.getDate() - i * step)
        const end = new Date(start)
        end.setDate(end.getDate() + step)
        buckets.push({ start, end, completed: 0 })
    }

    for (const c of completions) {
        const t = new Date(c)
        const bucket = buckets.find((b) => t >= b.start && t < b.end)
        if (bucket) bucket.completed++
    }

    return buckets.map((b, i) => {
        const isLast = i === buckets.length - 1
        const lastDay = new Date(b.end)
        lastDay.setDate(lastDay.getDate() - 1)
        return {
            label: daily
                ? (isLast ? 'Today' : i === buckets.length - 2 ? 'Yesterday' : shortDate(b.start))
                : (isLast ? 'This week' : shortDate(b.start)),
            range: daily ? shortDate(b.start) : `${shortDate(b.start)} – ${shortDate(lastDay)}`,
            completed: b.completed,
        }
    })
}
const formatDeadline = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function ProjectAnalytics() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState('daily')

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${BASE_URL}/api/projects/${id}/analytics`, {
                    credentials: 'include',
                })
                const data = await res.json()

                if (res.status === 403) {
                    toast.error('Only project admins can view analytics.')
                    navigate(`/projects/${id}`, { replace: true })
                    return
                }
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch analytics')
                }

                setAnalytics(data.analytics)
            } catch (error) {
                console.log('Error fetching analytics', error)
                toast.error(error.message || "Couldn't load analytics.")
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [id])

    if (loading) {
        return <div className="p-8 text-center text-stone-500">Loading analytics...</div>
    }

    if (!analytics) {
        return <div className="p-8 text-center text-stone-500">No analytics available.</div>
    }

    const { summary, priority, workload, unassigned, formerMembersDone, completions, attention } = analytics

    const statusData = [
        { name: 'To do', value: summary.todo, color: STATUS_COLORS.todo },
        { name: 'In progress', value: summary.inProgress, color: STATUS_COLORS.inProgress },
        { name: 'Done', value: summary.done, color: STATUS_COLORS.done },
    ].filter((s) => s.value > 0)

   const chartData = buildBuckets(completions, range)
const hasChartData = chartData.some((b) => b.completed > 0)

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate(`/projects/${id}`)}
                    className="cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition"
                >
                    <IoArrowBack className="text-stone-600" />
                </button>
                <h1 className="text-2xl font-semibold text-black">Project Analysis</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KpiCard label="Total tasks" value={summary.total} />
                <KpiCard label="Done" value={summary.done} hint={`${summary.completionRate}% complete`} accent="text-green-700" />
                <KpiCard label="In progress" value={summary.inProgress} accent="text-sky-700" />
                <KpiCard label="To do" value={summary.todo} />
                <KpiCard label="Overdue" value={summary.overdue} accent={summary.overdue > 0 ? 'text-red-600' : 'text-stone-900'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Panel title="Tasks by status">
                    {statusData.length === 0 ? (
                        <p className="text-sm text-stone-500 py-8 text-center">No tasks yet.</p>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                        {statusData.map((s) => <Cell key={s.name} fill={s.color} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="flex justify-center gap-4 text-xs text-stone-600 mt-2">
                        {statusData.map((s) => (
                            <span key={s.name} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name} ({s.value})
                            </span>
                        ))}
                    </div>
                </Panel>

                <Panel
    title={range === 'daily' ? 'Completed per day (last 14 days)' : 'Completed per week (last 8 weeks, Mon–Sun)'}
    action={
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {['daily', 'weekly'].map((m) => (
                <button
                    key={m}
                    onClick={() => setRange(m)}
                    className={`cursor-pointer px-3 py-1 transition ${
                        range === m ? 'bg-green-700 text-white' : 'text-stone-600 hover:bg-gray-50'
                    }`}
                >
                    {m === 'daily' ? 'Day' : 'Week'}
                </button>
            ))}
        </div>
    }
>
    {!hasChartData ? (
        <p className="text-sm text-stone-500 py-8 text-center">
            No tasks completed in this period yet.
        </p>
    ) : (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={range === 'daily' ? -35 : 0} textAnchor={range === 'daily' ? 'end' : 'middle'} height={range === 'daily' ? 50 : 30} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.range ?? label}
                        formatter={(value) => [value, 'Completed']}
                    />
                    <Bar dataKey="completed" fill={STATUS_COLORS.done} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )}
    {summary.onTimeRate !== null && (
        <p className="text-xs text-stone-500 mt-2 text-center">
            {summary.onTimeRate}% of finished tasks with a deadline were on time
        </p>
    )}
</Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <div className="lg:col-span-2">
                    <Panel title="Team workload">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-stone-500 uppercase tracking-wide">
                                        <th className="py-2 pr-4 font-medium">Member</th>
                                        <th className="py-2 px-2 font-medium text-center">Open</th>
                                        <th className="py-2 px-2 font-medium text-center">In progress</th>
                                        <th className="py-2 px-2 font-medium text-center">Done</th>
                                        <th className="py-2 pl-2 font-medium text-center">Overdue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workload.map((m) => (
                                        <tr key={m.userId} className="border-t border-gray-100">
                                            <td className="py-2 pr-4 text-stone-800">
                                                {m.fullname}
                                                {m.role === 'admin' && (
                                                    <span className="ml-2 text-xs text-stone-400">admin</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 text-center">{m.open}</td>
                                            <td className="py-2 px-2 text-center">{m.inProgress}</td>
                                            <td className="py-2 px-2 text-center text-green-700">{m.done}</td>
                                            <td className={`py-2 pl-2 text-center ${m.overdue > 0 ? 'text-red-600 font-semibold' : ''}`}>
                                                {m.overdue}
                                            </td>
                                        </tr>
                                    ))}
                                    {unassigned.open > 0 && (
                                        <tr className="border-t border-gray-100 text-stone-500">
                                            <td className="py-2 pr-4 italic">Unassigned</td>
                                            <td className="py-2 px-2 text-center">{unassigned.open}</td>
                                            <td className="py-2 px-2 text-center">-</td>
                                            <td className="py-2 px-2 text-center">-</td>
                                            <td className="py-2 pl-2 text-center">{unassigned.overdue}</td>
                                        </tr>
                                    )}
                                    {formerMembersDone > 0 && (
                                        <tr className="border-t border-gray-100 text-stone-500">
                                            <td className="py-2 pr-4 italic">Former members</td>
                                            <td className="py-2 px-2 text-center">-</td>
                                            <td className="py-2 px-2 text-center">-</td>
                                            <td className="py-2 px-2 text-center">{formerMembersDone}</td>
                                            <td className="py-2 pl-2 text-center">-</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </div>

                <Panel title="Open tasks by priority">
                    <div className="flex flex-col gap-2">
                        {['high', 'medium', 'low'].map((p) => (
                            <div key={p} className="flex items-center justify-between">
                                <span className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[p]}`}>
                                    {p}
                                </span>
                                <span className="text-lg font-semibold text-stone-800">{priority[p]}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            <div className="mt-4">
                <Panel title="Needs attention">
                    {attention.length === 0 ? (
                        <p className="text-sm text-stone-500 py-4 text-center">
                            Nothing overdue or due in the next 7 days.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {attention.map((t) => (
                                <button
                                    key={t._id}
                                    onClick={() => navigate(`/projects/${id}/tasks`)}
                                    className="cursor-pointer flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition text-left"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm text-stone-800 truncate">{t.title}</p>
                                        <p className="text-xs text-stone-500">
                                            {t.assigneeName || 'Unassigned'} · {t.priority} priority
                                        </p>
                                    </div>
                                    <span
                                        className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                                            t.isOverdue
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-orange-50 text-orange-800 border-orange-100'
                                        }`}
                                    >
                                        {t.isOverdue ? 'Overdue' : 'Due'} {formatDeadline(t.deadline)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    )
}