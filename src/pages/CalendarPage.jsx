import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import Calendar from '../components/Calendar'
import TaskDetailModal from '../components/TaskDetailModal'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function CalendarPage() {
    const currentUserId = useSelector((state) => state.auth.userId)

    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedMembers, setSelectedMembers] = useState([])

    const membersCache = useRef({})

    const fetchTasks = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/mine`, {credentials: 'include'})
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks')
            setTasks(data.tasks)
        } catch (error) {
            console.log('Error fetching tasks', error)
            toast.error(error.message || "Couldn't load your tasks.")
        } finally {
            setLoading(false)
        }
    }

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
    };
    
  return (
    <div className="p-4 md:p-8">
        <h1 className="text-2xl font-semibold mb-6">Calendar</h1>

        {loading ? (
            <div className="p-8 text-center text-stone-500">Loading your calendar...</div>
        ) : (
            <Calendar tasks={tasks} onOpen={openTask}/>
        )}

        {selectedTask && (
            <TaskDetailModal
                task={selectedTask}
                members={selectedMembers}
                currentUserId={currentUserId}
                onClose={() => setSelectedTask(null)}
                onUpdated={fetchTasks}
            />
        )}
    </div>
  )
}
