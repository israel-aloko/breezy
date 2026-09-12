import React, { useState } from 'react'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function ProjectFormModal({ project, onClose, onSaved }) {

    const [form, setForm] = useState({
        name: project?.name || '',
        description: project?.description || '',
        deadline: project?.deadline ? project.deadline.slice(0, 10) : '',
    })
    const [saving, setSaving] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.name.trim()) {
            toast.error('Project name is required')
            return
        }

        setSaving(true)
        try {
            const url = project
                ? `${BASE_URL}/api/projects/${project._id}`
                : `${BASE_URL}/api/projects`
            const method = project ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim(),
                    deadline: form.deadline || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save project')
            }

            toast.success(project ? 'Project updated' : 'Project created')
            onSaved(data.project)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700/70"
    const labelClass = "block text-xs font-medium text-[#00242b] uppercase mb-1"

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-green-900/10">
                <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold">
                        {project ? 'Edit project' : 'Create project'}
                    </h3>
                    <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className={labelClass}>Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="e.g. Website Redesign"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description *</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className={inputClass}
                            placeholder="What's this project about?"
                            required
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold disabled:opacity-50 transition shadow-sm cursor-pointer"
                        >
                            {saving ? 'Saving...' : project ? 'Update project' : 'Create project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
