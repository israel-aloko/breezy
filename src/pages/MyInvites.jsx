import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function MyInvites() {
    const navigate = useNavigate();
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actioningId, setActioningId] = useState(null) //disables buttons on the invite being processed

    const fetchInvites = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${BASE_URL}/api/invites/mine`, {
                credentials: 'include',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to fetch invites')
            }

            setInvites(data.invites)
        } catch (error) {
            console.log('Error fetch invites', error)
            toast.error("Couldn't load your invites.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchInvites()
    }, [])

    const respondToInvite = async (toke, action) => {
        setActioningId(token)
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
                setInvites(prev => prev.filter(inv => inv.token !== token))
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setActioningId(null)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-stone-500">Loading your invites...</div>
    }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-stone-900 mb-6">My Invites</h1>
 
      {invites.length === 0 ? (
        <div className="text-center text-stone-500 py-12">
          You have no pending invites.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invites.map((invite) => (
            <div
              key={invite.token}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100"
            >
              <div>
                <p className="text-sm font-medium text-stone-800">{invite.project?.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Invited by {invite.invitedBy?.fullname}
                </p>
              </div>
 
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => respondToInvite(invite.token, 'decline')}
                  disabled={actioningId === invite.token}
                  className="cursor-pointer px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => respondToInvite(invite.token, 'accept')}
                  disabled={actioningId === invite.token}
                  className="cursor-pointer px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition disabled:opacity-50"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
