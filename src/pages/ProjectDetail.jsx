import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectFormModal from '../components/ProjectFormModal'
import InviteMemberModal from '../components/InviteMemberModal'
import { IoPersonAddSharp } from 'react-icons/io5'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUserId = useSelector(state => state.auth.userId)

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)

    const fetchProject = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch project')
            }

            setProject(data.project)
        } catch (error) {
            console.log('Error fetch project', error)
            toast.error(error.message || "Couldn't load this project.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProject()
    }, [id])

    const myMembership = project?.members.find(m => m.user._id === currentUserId)
    const isAdmin = myMembership?.role === 'admin'

    const deleteProject = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete project')
            }

            toast.success('Project deleted')
            navigate('/projectdashboard')
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDeleteClick = () => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-red-600">This cannot be undone.</span>
                <span>Permanently delete "{project.name}" and remove all members?</span>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); deleteProject() }}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg bg-red-600 text-white font-semibold"
                    >
                        Delete permanently
                    </button>
                </div>
            </div>
        ), { duration: 8000 })
    }

    if (loading) {
        return <div className="p-8 text-center text-stone-500">Loading project...</div>
    }

    if (!project) {
        return <div className="p-8 text-center text-stone-500">Project not found.</div>
    }

    const formattedDeadline = project.deadline
        ? new Date(project.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto mt-20">

            <div className="flex items-start justify-between mb-2 gap-4">
                <h1 className="text-2xl font-semibold text-stone-900">{project.name}</h1>

                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => navigate(`/projects/${id}/tasks`)}
                        className="cursor-pointer px-3 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition shadow-sm"
                    >
                        View Tasks
                    </button>
                    <button
                        onClick={() => navigate(`/projects/${id}/activity`)}
                        className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Activity
                    </button>

                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setShowEditForm(true)}
                                className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="cursor-pointer px-3 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {project.description && (
                <p className="text-stone-600 mb-2">{project.description}</p>
            )}

            {formattedDeadline && (
                <p className="text-sm text-stone-500 mb-6">Deadline: {formattedDeadline}</p>
            )}

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between p-4 rounded-lg border border-gray-100">
                <div>
                    <h3 className="text-sm font-semibold text-stone-700">
                        Members ({project.members.length})
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                        {isAdmin
                            ? 'Invite people, manage the join code, review join requests, or remove members.'
                            : 'View who else is on this project.'}
                    </p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex flex-row gap-2 items-center cursor-pointer flex-shrink-0 bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-800 transition shadow-sm"
                >
                    <IoPersonAddSharp />{isAdmin ? 'Manage' : 'View'}
                </button>
            </div>

            {showEditForm && (
                <ProjectFormModal
                    project={project}
                    onClose={() => setShowEditForm(false)}
                    onSaved={() => { setShowEditForm(false); fetchProject() }}
                />
            )}

            {showInviteModal && (
                <InviteMemberModal
                    project={project}
                    isAdmin={isAdmin}
                    onClose={() => setShowInviteModal(false)}
                    onUpdated={fetchProject}
                />
            )}

        </div>
    )
}
