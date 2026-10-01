import React, { useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const PRIORITY_STYLES = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done',
}

const MODES = ['month', 'week', 'day']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MAX_CHIPS = 3

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

const startOfWeek = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7))

const dayKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const isOverdue = (task) =>
    task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()

function TaskChip({ task, onOpen, showProject }) {
    const overdue = isOverdue(task)
    return (
        <button
            type="button"
            onClick={() => onOpen(task)}
            title={task.title}
            className={`cursor-pointer w-full text-left rounded-md px-2 py-1 text-xs font-medium transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-green-700/30 ${PRIORITY_STYLES[task.priority]} ${overdue ? 'ring-1 ring-red-400' : ''} ${task.status === 'done' ? 'line-through opacity-60' : ''}`}
        >
            <span className="block truncate">{task.title}</span>
            {showProject && task.project?.name && (
                <span className="block truncate font-normal opacity-80">{task.project.name}</span>
            )}
        </button>
    )
}

export default function Calendar({ tasks = [], onOpen =() => {} }) {
    const [mode, setMode] = useState('month')
    const [cursor, setCursor] = useState(() => startOfDay(new Date()))
 
    const today = startOfDay(new Date())

    const tasksByDay = useMemo(() => {
        const map = {}
        tasks.forEach((t) => {
            if (!t.deadline) return
            const key = dayKey(new Date(t.deadline))
            ;(map[key] ||= []).push(t)
        })
        Object.values(map).forEach((list) =>
            list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        )
        return map
    }, [tasks])
 
    const noDeadlineCount = tasks.filter((t) => !t.deadline).length
 
    const tasksOn = (d) => tasksByDay[dayKey(d)] || []
 
    const shift = (dir) => {
        setCursor((c) => {
            if (mode === 'month') return new Date(c.getFullYear(), c.getMonth() + dir, 1)
            return addDays(c, dir * (mode === 'week' ? 7 : 1))
        })
    }
 
    const goToDay = (d) => {
        setCursor(startOfDay(d))
        setMode('day')
    }
 
    const label = (() => {
        if (mode === 'month') {
            return cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        }
        if (mode === 'week') {
            const start = startOfWeek(cursor)
            const end = addDays(start, 6)
            const short = { month: 'short', day: 'numeric' }
            return `${start.toLocaleDateString(undefined, short)} to ${end.toLocaleDateString(undefined, { ...short, year: 'numeric' })}`
        }
        return cursor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    })()
 
    const dateBadge = (d) => {
        const isToday = dayKey(d) === dayKey(today)
        return (
            <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${isToday ? 'bg-green-700 text-white font-semibold' : 'text-stone-600'}`}
            >
                {d.getDate()}
            </span>
        )
    }
 
    const renderMonth = () => {
        const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
        const lastOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
 
        const days = []
        for (let d = startOfWeek(firstOfMonth); d <= lastOfMonth || days.length % 7 !== 0; d = addDays(d, 1)) {
            days.push(d)
        }
 
        return (
            <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 bg-stone-50 border-b border-gray-100">
                    {WEEKDAYS.map((w) => (
                        <div key={w} className="px-2 py-2 text-xs font-medium text-stone-500 text-center">
                            {w}
                        </div>
                    ))}
                </div>
 
                <div className="grid grid-cols-7 gap-px bg-gray-100">
                    {days.map((d) => {
                        const list = tasksOn(d)
                        const inMonth = d.getMonth() === cursor.getMonth()
                        const extra = list.length - MAX_CHIPS
                        return (
                            <div
                                key={dayKey(d)}
                                className={`min-h-[6.5rem] p-1.5 flex flex-col gap-1 ${inMonth ? 'bg-white' : 'bg-stone-50'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => goToDay(d)}
                                    className={`cursor-pointer self-start ${inMonth ? '' : 'opacity-50'}`}
                                    aria-label={`Open ${d.toDateString()}`}
                                >
                                    {dateBadge(d)}
                                </button>
 
                                {list.slice(0, MAX_CHIPS).map((t) => (
                                    <TaskChip key={t._id} task={t} onOpen={onOpen} />
                                ))}
 
                                {extra > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => goToDay(d)}
                                        className="cursor-pointer text-left text-xs font-medium text-stone-500 hover:text-green-700 px-1"
                                    >
                                        +{extra} more
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const renderWeek = () => {
        const start = startOfWeek(cursor)
        const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
 
        return (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                {days.map((d, i) => {
                    const list = tasksOn(d)
                    return (
                        <div key={dayKey(d)} className="bg-white min-h-[8rem] md:min-h-[16rem] p-2 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-stone-500">{WEEKDAYS[i]}</span>
                                {dateBadge(d)}
                            </div>
                            {list.length > 0 ? (
                                list.map((t) => <TaskChip key={t._id} task={t} onOpen={onOpen} showProject />)
                            ) : (
                                <span className="text-xs text-stone-300">No tasks</span>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderDay = () => {
        const list = tasksOn(cursor)
        return (
            <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                {list.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {list.map((t) => (
                            <div key={t._id} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <TaskChip task={t} onOpen={onOpen} showProject />
                                </div>
                                <span className="text-xs text-stone-500 w-24 text-right">{STATUS_LABELS[t.status]}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-stone-400 text-center py-8">Nothing is due on this day.</p>
                )}
            </div>
        )
    }
 
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => shift(-1)}
                        className="cursor-pointer p-2 rounded-lg border border-gray-200 bg-white text-stone-600 hover:bg-gray-50"
                        aria-label="Previous"
                    >
                        <FiChevronLeft />
                    </button>
                    <button
                        type="button"
                        onClick={() => shift(1)}
                        className="cursor-pointer p-2 rounded-lg border border-gray-200 bg-white text-stone-600 hover:bg-gray-50"
                        aria-label="Next"
                    >
                        <FiChevronRight />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCursor(today)}
                        className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-stone-600 hover:bg-gray-50"
                    >
                        Today
                    </button>
                    <h2 className="text-base font-semibold text-stone-800 ml-1">{label}</h2>
                </div>
 
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                    {MODES.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`cursor-pointer px-4 py-2 capitalize transition ${mode === m ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
 
            {mode === 'month' && renderMonth()}
            {mode === 'week' && renderWeek()}
            {mode === 'day' && renderDay()}
 
            {noDeadlineCount > 0 && (
                <p className="text-xs text-stone-400 mt-3">
                    {noDeadlineCount} {noDeadlineCount === 1 ? 'task has' : 'tasks have'} no deadline, so{' '}
                    {noDeadlineCount === 1 ? "it isn't" : "they aren't"} shown here. You can still find {noDeadlineCount === 1 ? 'it' : 'them'} in the Board and List views.
                </p>
            )}
        </div>
    )
}
 