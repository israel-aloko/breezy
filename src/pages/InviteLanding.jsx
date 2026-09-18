import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function InviteLanding() {
  const { token } = useParams()
  const navigate = useNavigate()
  const auth = useSelector(state => state.auth)

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responding, setResponding] = useState(false)

  const fetchInvite = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/invites/${token}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'This invite could not be found.')
      }

      setInvite(data.invite)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvite()
  }, [token])

  const respond = async (action) => {
    setResponding(true)
    try {
      const res = await fetch(`${BASE_URL}/api/invites/${token}/${action}`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} invite`)
      }

      if (action === 'accept') {
        toast.success('Invite accepted!')
        navigate(`/projects/${data.project._id}`)
      } else {
        toast.success('Invite declined')
        navigate('/projectdashboard')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-stone-500">Loading invite...</div>
  }

  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <p className="text-stone-600">{error}</p>
        <Link to="/projectdashboard" className="inline-block mt-4 text-green-700 hover:underline text-sm">
          Go to my projects
        </Link>
      </div>
    )
  }

  // Logged out, and the invited email HAS an account — send them to log in.
  if (!auth.isAuthenticated && invite.hasAccount) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-semibold text-stone-900 mb-2">You've been invited!</h1>
        <p className="text-stone-600 mb-1">
          <span className="font-medium">{invite.invitedBy?.fullname}</span> invited you to join{' '}
          <span className="font-medium">{invite.project?.name}</span>.
        </p>
        <p className="text-sm text-stone-500 mb-6">Log in to accept or decline this invite.</p>
        <Link
          to="/login"
          state={{ from: `/invites/${token}` }}
          className="inline-block px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition"
        >
          Log in to continue
        </Link>
      </div>
    )
  }

  // Logged out, and the invited email has NO account yet — send them to register.
  // The token rides along in the query string; registerService picks it up and
  // auto-joins the project once they verify their OTP.
  if (!auth.isAuthenticated && !invite.hasAccount) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-semibold text-stone-900 mb-2">You've been invited!</h1>
        <p className="text-stone-600 mb-1">
          <span className="font-medium">{invite.invitedBy?.fullname}</span> invited you to join{' '}
          <span className="font-medium">{invite.project?.name}</span>.
        </p>
        <p className="text-sm text-stone-500 mb-6">Create an account to accept this invite. You'll join the project automatically once you're verified.</p>
        <Link
          to={`/signup?invite=${token}`}
          className="inline-block px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition"
        >
          Create an account
        </Link>
      </div>
    )
  }

  // Logged in as someone other than the invited email — accept/decline would 403 anyway,
  // so tell them clearly instead of letting them hit a confusing error.
  if (auth.email && invite.email !== auth.email.toLowerCase()) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <p className="text-stone-600">
          This invite was sent to <span className="font-medium">{invite.email}</span>, but you're logged in as a different account.
        </p>
        <p className="text-sm text-stone-500 mt-2">Log out and log back in with the invited email to accept it.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-xl font-semibold text-stone-900 mb-2">You've been invited!</h1>
      <p className="text-stone-600 mb-6">
        <span className="font-medium">{invite.invitedBy?.fullname}</span> invited you to join{' '}
        <span className="font-medium">{invite.project?.name}</span>.
      </p>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => respond('decline')}
          disabled={responding}
          className="cursor-pointer px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={() => respond('accept')}
          disabled={responding}
          className="cursor-pointer px-4 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition disabled:opacity-50"
        >
          Accept
        </button>
      </div>
    </div>
  )
}