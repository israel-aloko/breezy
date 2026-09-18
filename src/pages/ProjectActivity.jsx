import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoArrowBack } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

//turns a raw activity entry into a readable sentence.
//kept outside the component so it's easy to extend per event type.
const describeActivity = (activity) => {
    const actorName = activity.actor?.fullname || 'Someone'
    const { type, metadata = {} } = activity

    switch (type) {
        case 'task_created':
            return `${actorName} created task "${metadata.taskTitle}"`

        case 'task_status_changed':
            return `${actorName} moved "${metadata.taskTitle}" from ${metadata.from} to ${metadata.to}`
        
        case 'task_assigned':
            return metadata.previousAssignee
                ? `${actorName} reassigned "${metadata.taskTitle}"`
                : `${actorName} assigned "${metadata.taskTitle}"`

        case 'task_updated':
            return `${actorName} updated ${metadata.field} on "${metadata.taskTitle}"`

        case 'member_joined':
            return metadata.via === 'invite'
                ? `${actorName} joined the project via invite`
                : `${actorName} joined the project via join code`
        
        case 'project_created':
            return `${actorName} created the project`

        default: 
            return `${actorName} did something`
    }
}

const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}
export default function ProjectActivity() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchActivity = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${id}/activity`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch activity')
            }

            setActivities(data.activities)
        } catch (error) {
            console.log('Error fetching activity', error)
            toast.error(error.message || "Couldn't load activity.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivity()
    }, [id])

    if (loading) {
        return <div className="p-8 text-center text-stone -500">Loading activity...</div>
    }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto mt-20">
        
        <div className="flex items-center gap-3 mb-6">
            <button
                onClick={() => navigate(`/projects/${id}`)}
                className="cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition"
            >
                <IoArrowBack className="text-stone-600" />
            </button>
            <h1 className="text-2xl font-semibold text-stone-900">Activity</h1>
        </div>

        {activities.length === 0 ? (
            <div className="text-center text stone-500 py-12 border border-border-gray-100 rounded-lg">
                No activity yet.
            </div>
        ) : (
            <div className="flex flex-col gap-2">
                {activities.map((activity) => (
                    <div
                        key={activity._id}
                        className="flex items-start justify-between p-3 rounded-lg border border-gray-100"
                    >
                        <p className="text-sm text-stone 800">{describeActivity(activity)}</p>
                        <span className="text-xs text-stone-400 flex-shrink-0 ml-4">
                            {formatTimestamp(activity.createdAt)}
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}
