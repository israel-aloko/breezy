import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ProjectFormModal from '../components/ProjectFormModal'
import InviteMemberModal from '../components/InviteMemberModal'
import { IoEllipsisHorizontal, IoPersonAddSharp } from 'react-icons/io5'
import TaskBoard from './TaskBoard'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AVATAR_COLORS = [
    'bg-green-100 text-green-800',
    'bg-amber-100 text-amber-800',
    'bg-sky-100 text-sky-800',
    'bg-rose-100 text-rose-800',
    'bg-violet-100 text-violet-800',
]

const getMemberName = (member) =>
    member.user?.name ||
    member.user?.fullname ||
    member.user?.username ||
    member.user?.email ||
    '?'
// const getMemberName = (member) =>
//     member.user?.name ||
//     member.user?.fullName ||
//     member.user?.username ||
//     member.user?.email ||
//     '?'

const MAX_AVATARS = 5

export default function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const currentUserId = useSelector(state => state.auth.userId)

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null);

    const [searchParams, setSearchParams] = useSearchParams()
    const manageTab = searchParams.get('manage')

    useEffect(() => {
        if (manageTab && project) {
            setShowInviteModal(true)
        }
    }, [manageTab, project]);

    //close the overflow menu on outside click or escape
    useEffect(() => {
        if (!menuOpen) return
        const onClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [menuOpen])

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
            console.log('members:', data.project.members)
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
        setMenuOpen(false)
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

    const leaveProject = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/projects/${id}/leave`, {
                method: 'POST',
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to leave project')
            }

            toast.success('You left the project')
            navigate('/projectdashboard')
        } catch (error) {
            toast.error(error.message)
        }
    };
    const handleLeaveClick = () => {
        setMenuOpen(false)
        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="font-semibold text-stone-900">Leave this project?</span>
                <span>You'll lose to access to "{project.name}" and its tasks. You would need a new invite or join code to come back.</span>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); leaveProject() }}
                        className="cursor-pointer px-3 py-1 text-sm rounded-lg bg-red-600 text-white font-semibold"
                    >
                        Leave project
                    </button>
                </div>
            </div>
        ), { duration: 8000 })
    };


    if (loading && !project) {
        return <div className="p-8 text-center text-stone-500">Loading project...</div>
    }

    if (!project) {
        return <div className="p-8 text-center text-stone-500">Project not found.</div>
    }

    const formattedDeadline = project.deadline
        ? new Date(project.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    const adminCount = project?.members.filter(m => m.role === 'admin').length ?? 0
    const isLastAdmin = isAdmin && adminCount === 1

    const visibleMembers = project.members.slice(0, MAX_AVATARS)
    const extraMembers = project.members.length - visibleMembers.length
    
    return (
       <div className="p-4 md:p-8 max-w-6xl mx-auto">

            <button
                onClick={() => navigate('/projectdashboard')}
                className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700 transition mb-3"
            >
                ← All projects
            </button>

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-3xl font-semibold text-stone-900 leading-tight">{project.name}</h1>
                    {project.description && (
                        <p className="text-stone-600 mt-2 max-w-2xl">{project.description}</p>
                    )}
                </div>

                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Project actions"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        className="cursor-pointer p-2.5 rounded-lg border border-gray-200 text-stone-600 hover:bg-gray-50 transition"
                    >
                        <IoEllipsisHorizontal size={18} />
                    </button>

                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20"
                        >
                            {isAdmin && (
                                <button
                                    role="menuitem"
                                    onClick={() => { setMenuOpen(false); setShowEditForm(true) }}
                                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition"
                                >
                                    Edit project
                                </button>
                            )}
                            {isAdmin && (
                                <button
                                    role="menuitem"
                                    onClick={handleDeleteClick}
                                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    Delete project
                                </button>
                            )}
                            {isAdmin && <div className="my-1 border-t border-gray-100" />}
                            <button
                                role="menuitem"
                                onClick={handleLeaveClick}
                                disabled={isLastAdmin}
                                title={isLastAdmin ? 'Promote another admin before leaving, or delete the project' : ''}
                                className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                                Leave project
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-gray-100">
                <div className="flex items-center gap-4 flex-wrap">
                    {formattedDeadline && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-800 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                            Due {formattedDeadline}
                        </span>
                    )}

                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="cursor-pointer flex items-center gap-3 group"
                        aria-label="Open members"
                    >
                        <div className="flex -space-x-2">
                            {visibleMembers.map((m, i) => {
                                const name = getMemberName(m)
                                return (
                                    <span
                                        key={m.user._id}
                                        title={`${name}${m.role === 'admin' ? ' (admin)' : ''}`}
                                        className={`w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-xs font-semibold uppercase ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                                    >
                                        {name.charAt(0)}
                                    </span>
                                )
                            })}
                            {extraMembers > 0 && (
                                <span className="w-8 h-8 rounded-full ring-2 ring-white bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-semibold">
                                    +{extraMembers}
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-stone-600 group-hover:text-stone-900 transition">
                            {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                        </span>
                    </button>
                </div>

                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex flex-row gap-2 items-center justify-center cursor-pointer flex-shrink-0 bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-800 transition shadow-sm"
                >
                    <IoPersonAddSharp />{isAdmin ? 'Manage members' : 'View members'}
                </button>
            </div>

            <div className="mt-8">
                <TaskBoard project={project} />
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
                    initialTab={manageTab === 'requests' && isAdmin ? 'requests' : 'invite'}
                    onClose={() => {
                        setShowInviteModal(false)
                        setSearchParams({}, { replace: true })
                    }}
                    onUpdated={fetchProject}
                />
            )}
        </div>
    )
}
