import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ProjectCard from '../components/ProjectCard'
import ProjectFormModal from '../components/ProjectFormModal'
import JoinWithCodeModal from '../components/JoinWithCodeModal'


const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function ProjectsDashboard() {

    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)

    const fetchProjects = async () => {
        setLoading(true)
        toast.loading("Loading your projects...", { id: "projects" })
        try {
            const res = await fetch(`${BASE_URL}/api/projects`, {
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Failed to fetch projects')
            }

            const data = await res.json()
            setProjects(data.projects)
            toast.dismiss("projects")
        } catch (error) {
            console.log("Error fetching projects", error)
            toast.error("Couldn't load your projects. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">My Projects</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="cursor-pointer px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Join with code
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="cursor-pointer bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-800 transition shadow-sm"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    loading ? (
                        <div className="col-span-full text-center">Loading...</div>
                    ) : projects.length > 0 ? (
                        projects.map((project) => (
                            <ProjectCard key={project._id} {...project} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-stone-500">
                            You're not part of any projects yet.
                        </div>
                    )
                }
            </div>

            {showForm && (
                <ProjectFormModal
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); fetchProjects() }}
                />
            )}

            {showJoinModal && (
                <JoinWithCodeModal onClose={() => setShowJoinModal(false)} />
            )}
        </div>
    )
}
