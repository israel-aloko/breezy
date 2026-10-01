import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { userUpdated } from '../features/reducers/authSlice'
import { Link } from 'react-router-dom'


const API = import.meta.env.VITE_API_BASE_URL
const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const timezones = (() => {
    try {
        return Intl.supportedValuesOf('timeZone')
    } catch {
        return ['UTC', 'Africa/Lagos']
    }
})()

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#27614a]'

export default function ProfilePage() {
    const dispatch = useDispatch()
    const { fullname, email, profilePicture, jobTitle, bio, timezone, provider } =
        useSelector((state) => state.auth)

    const fileRef = useRef(null)
    const [uploading, setUploading] = useState(false)

    // ---- details form ----
    const [form, setForm] = useState({ fullname: '', jobTitle: '', bio: '', timezone: 'UTC' })
    const [saving, setSaving] = useState(false)

    // keep the form in sync with the store (e.g. after /me finishes loading)
    useEffect(() => {
        setForm({
            fullname: fullname || '',
            jobTitle: jobTitle || '',
            bio: bio || '',
            timezone: timezone || 'UTC',
        })
    }, [fullname, jobTitle, bio, timezone])

    const isDirty =
        form.fullname !== (fullname || '') ||
        form.jobTitle !== (jobTitle || '') ||
        form.bio !== (bio || '') ||
        form.timezone !== (timezone || 'UTC')

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const useBrowserTimezone = () => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        setForm((f) => ({ ...f, timezone: tz }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.fullname.trim()) return toast.error('Full name cannot be empty.')

        setSaving(true)
        try {
            const res = await fetch(`${API}/api/users/me`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message || 'Could not save changes.')

            const u = data.user
            dispatch(
                userUpdated({
                    fullname: u.fullname,
                    jobTitle: u.jobTitle,
                    bio: u.bio,
                    timezone: u.timezone,
                })
            )
            toast.success('Profile updated.')
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // ---- avatar ----
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = '' // lets the same file be picked again later
        if (!file) return

        if (!file.type.startsWith('image/')) return toast.error('Please choose an image file.')
        if (file.size > MAX_AVATAR_BYTES) return toast.error('Image must be under 2MB.')

        const body = new FormData()
        body.append('avatar', file) // field name must match uploadAvatar middleware

        setUploading(true)
        try {
            // no Content-Type header: the browser sets the multipart boundary itself
            const res = await fetch(`${API}/api/users/me/avatar`, {
                method: 'POST',
                credentials: 'include',
                body,
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message || 'Upload failed.')

            dispatch(userUpdated({ profilePicture: data.profilePicture }))
            toast.success('Photo updated.')
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    // ---- password ----
    const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
    const [changingPw, setChangingPw] = useState(false)

    const handlePwChange = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }))

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters.')
        if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match.')

        setChangingPw(true)
        try {
            const res = await fetch(`${API}/api/users/me/password`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: pw.currentPassword,
                    newPassword: pw.newPassword,
                }),
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message || 'Could not change password.')

            setPw({ currentPassword: '', newPassword: '', confirm: '' })
            toast.success('Password updated.')
        } catch {
            toast.error('Network error. Please try again.')
        } finally {
            setChangingPw(false)
        }
    }

    const initials = fullname
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    const tzOptions = timezones.includes(form.timezone) ? timezones : [form.timezone, ...timezones]
    const isGoogleOnly = provider === 'google'

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-[#00242b]">Your profile</h1>

            {/* Photo */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
                <div className="w-24 h-24 rounded-full bg-[#27614a] text-white flex items-center justify-center overflow-hidden text-2xl font-semibold shrink-0">
                    {profilePicture ? (
                        <img src={profilePicture} alt={fullname} className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <p className="font-medium text-[#00242b]">Profile photo</p>
                    <p className="text-sm text-gray-500 mb-3">JPG or PNG, up to 2MB.</p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="cursor-pointer px-4 py-2 rounded-lg bg-[#00242b] text-white text-sm hover:bg-[#012c35] disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Change photo'}
                    </button>
                </div>
            </section>

            {/* Details */}
            <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-medium text-[#00242b]">Details</h2>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Full name</label>
                    <input name="fullname" value={form.fullname} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input value={email || ''} disabled className={`${inputClass} bg-gray-100 text-gray-500`} />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Job title</label>
                    <input
                        name="jobTitle"
                        value={form.jobTitle}
                        onChange={handleChange}
                        maxLength={60}
                        placeholder="e.g. Backend developer"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        maxLength={300}
                        rows={3}
                        className={inputClass}
                    />
                    <p className="text-xs text-gray-400 text-right">{form.bio.length}/300</p>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Timezone</label>
                    <div className="flex gap-2">
                        <select
                            name="timezone"
                            value={form.timezone}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            {tzOptions.map((tz) => (
                                <option key={tz} value={tz}>{tz}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={useBrowserTimezone}
                            className="shrink-0 px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                        >
                            Use my current timezone
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!isDirty || saving}
                        className="px-5 py-2 rounded-lg bg-[#27614a] text-white text-sm hover:bg-[#1f5039] disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-green-800 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>
            </form>




        </div>
    )
}