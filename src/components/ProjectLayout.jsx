import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { IoMenuOutline, IoCloseOutline, IoHomeOutline, IoFolderOutline } from 'react-icons/io5'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function ProjectLayout({ children }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/projects`, { credentials: 'include' })
                const data = await res.json()
                if (res.ok) setProjects(data.projects || [])
            } catch {
                // sidebar list is a nice-to-have; fail silently
            }
        }
        fetchProjects()
    }, [])

    const renderNav = (onNavigate) => (
        <div className="flex flex-col gap-1">
            <button
                onClick={() => { navigate('/projectdashboard'); onNavigate?.() }}
                className="cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-stone-600 hover:bg-gray-50 transition text-left"
            >
                <IoHomeOutline size={16} />
                Dashboard
            </button>

            <div className="text-xs text-stone-400 px-2.5 pt-4 pb-1">Your projects</div>

            <div className="flex flex-col gap-0.5">
                {projects.map((p) => (
                    <button
                        key={p._id}
                        onClick={() => { navigate(`/projects/${p._id}`); onNavigate?.() }}
                        className={`cursor-pointer flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left transition ${
                            p._id === id
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-stone-600 hover:bg-gray-50'
                        }`}
                    >
                        <IoFolderOutline size={16} className="flex-shrink-0" />
                        <span className="truncate">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div className="mt-20 flex max-w-6xl mx-auto">

            {/* mobile top strip */}
            <div className="md:hidden fixed top-20 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <button onClick={() => setSidebarOpen(true)} className="cursor-pointer p-1 text-stone-600">
                    <IoMenuOutline size={22} />
                </button>
                <span className="text-sm font-medium text-stone-700">Projects</span>
            </div>

            {/* mobile drawer */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/40"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div
                        className="w-64 h-full bg-white p-4 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold text-stone-700">Projects</span>
                            <button onClick={() => setSidebarOpen(false)} className="cursor-pointer text-stone-500">
                                <IoCloseOutline size={20} />
                            </button>
                        </div>
                        {renderNav(() => setSidebarOpen(false))}
                    </div>
                </div>
            )}

            {/* desktop sidebar */}
            <aside className="hidden md:block w-56 flex-shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto border-r border-gray-100 px-4 py-6">
                {renderNav()}
            </aside>

            {/* main content */}
            <main className="flex-1 min-w-0 px-4 md:px-8 py-6 pt-16 md:pt-6">
                {children}
            </main>
        </div>
    )
}