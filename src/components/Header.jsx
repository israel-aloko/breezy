import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LOGOS } from '../assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser, FaBoxOpen, FaRegHeart } from 'react-icons/fa'
import { RiMenu3Fill } from 'react-icons/ri'
import { logout } from '../features/reducers/authSlice'
import { FiLogOut } from 'react-icons/fi'
import { MdHistory } from 'react-icons/md'
import SearchBar from './SearchBar'
import SearchResultsList from './SearchResultsList'
import { IoNotifications } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { LuMailPlus } from 'react-icons/lu'


const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Same idea as the ProjectActivity formatter — turns a notification's
// raw type/metadata into a readable sentence for the dropdown.
const describeNotification = (n) => {
  const actorName = n.actor?.fullname || 'Someone'
  const { type, metadata = {} } = n

  switch (type) {
    case 'task_assigned':
      return metadata.previousAssignee
        ? `You were unassigned from "${metadata.taskTitle}"`
        : `${actorName} assigned you to "${metadata.taskTitle}"`
    case 'task_status_changed':
      return `${actorName} moved "${metadata.taskTitle}" to ${metadata.to}`
    case 'task_deleted':
      return `${actorName} deleted "${metadata.taskTitle}"`
    case 'member_joined':
      return `${actorName} joined your project`
    default:
      return `${actorName} did something`
  }
}

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const loggedIn = auth.isAuthenticated;

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    dispatch(logout());
    window.location.href = "/login";
  }

  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const [invites, setInvites] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actioningToken, setActioningToken] = useState(null);

  const fetchInvites = async () => {
    if (!loggedIn) return;
    try {
      const res = await fetch(`${BASE_URL}/api/invites/mine`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setInvites(data.invites);
      }
    } catch (error) {
      console.log('Error fetching invites', error);
    }
  }

  const fetchNotifications = async () => {
    if (!loggedIn) return;
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/mine`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log('Error fetching notifications', error);
    }
  }

  useEffect(() => {
    fetchInvites();
    fetchNotifications();
  }, [loggedIn]);

  const respondToInvite = async (token, action) => {
    setActioningToken(token);
    try {
      const res = await fetch(`${BASE_URL}/api/invites/${token}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} invite`);
      }

      setInvites(prev => prev.filter(inv => inv.token !== token));

      if (action === 'accept') {
        toast.success('Invite accepted');
        setInviteOpen(false);
        navigate(`/projects/${data.project._id}`);
      } else {
        toast.success('Invite declined');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActioningToken(null);
    }
  }

  // Marks it read (optimistic, so the badge updates immediately without
  // waiting on the network) then navigates to the relevant page.
  const handleNotificationClick = async (notification) => {
    setNotifications(prev =>
      prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
    );
    setNotifOpen(false);

    try {
      await fetch(`${BASE_URL}/api/notifications/${notification._id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Error marking notification as read', error);
    }

    const destination = notification.type === 'member_joined'
      ? `/projects/${notification.project}`
      : `/projects/${notification.project}/tasks`;

    navigate(destination);
  }

  const handleClearAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to clear notifications');
    } catch (error) {
      toast.error(error.message || "Couldn't clear notifications.");
      fetchNotifications(); // resync on failure since we optimistically updated
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      setNavOpen(false)
    }
  }, [location.pathname]);

  const navLinks = [
    // { id: "1230", name: 'Project', path: '/projectdashboard' },
    // { id: "1231", name: 'Timeline', path: '/shop' },
    // { id: "1232", name: 'About', path: '/about' },
    // { id: "1233", name: 'Contact', path: '/contact' },
  ]

  const [results, setResults] = useState([]);

  return (
    <header className="bg-white py-1 md:py-0 fixed top-0 left-0 w-full z-50 shawdow-lg md:border-2 md:border-green-900">
      <div className="container mx-auto px-4 md:px-6 py-2 md:py-2 flex flex-row justify-between items-center gap-4 md:gap-8 box-border">

        <a href="/"><img className='w-[45vw] md:w-[25vw]' src={LOGOS.izzyroots_logo} alt="" /></a>

        <SearchBar setResults={setResults} />
        <SearchResultsList results={results} />

        <nav className={`flex flex-col md:flex-row justify-between items-center gap-4 md:gap-9 ${navOpen ? "block absolute top-16 left-0 bg-white w-full border-2 border-green-800" : "hidden md:flex"} md:static md:w-auto md:p-0`}>
          {
            navLinks.map((link) => (
              (link.path === "/contact") ?
                <a className="text-lg font-sm font-semibold hover:text-green-600 duration-300 ease-in-out" key={link.id} href={link.path}>{link.name}</a>
                :
                <Link className="text-lg font-sm font-semibold hover:text-green-600" key={link.id} to={link.path}>{link.name}</Link>
            ))}
        </nav>

        <div className="relative">
          <a href="/projectdashboard" className="flex items-center bg-green-700 hover:bg-green-800 text-white px-4 rounded-lg transition cursor-pointer">create</a>
        </div>

        <div className="flex flex-row justify-between items-center gap-4 md:gap-8 text-2xl pr-1.5">
          {!loggedIn ? (
            <a href="/login">
              <FaUser className='text-green-900 hover:text-green-600 duration-300 ease-in-out cursor-pointer' />
            </a>
          ) : (
            <>
              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-1 text-green-900 hover:text-red-600 duration-300 ease-in-out"
              >
                <FiLogOut />
                <span className="hidden md:inline text-sm">Logout</span>
              </button>


            </>
          )}

          <div className="relative">
            <LuMailPlus
              onClick={() => { setInviteOpen(!inviteOpen); if (!inviteOpen) fetchInvites(); }}
              className='text-teal-900 hover:text-teal-600 duration-300 ease-in-out cursor-pointer'
            />
            {invites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">{invites.length}</span>
            )}
            {inviteOpen && (
              <div className="absolute right-0 top-10 bg-white border-2 border-teal-800 rounded-2xl text-base w-80 py-2 z-50 max-h-96 overflow-y-auto">
                {invites.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500 text-center">No pending invites</p>
                ) : (
                  invites.map((invite) => (
                    <div key={invite.token} className="px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                      <p className="text-sm font-semibold">{invite.project?.name}</p>
                      <p className="text-xs text-gray-500 mb-2">Invited by {invite.invitedBy?.fullname}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToInvite(invite.token, 'decline')}
                          disabled={actioningToken === invite.token}
                          className="cursor-pointer flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => respondToInvite(invite.token, 'accept')}
                          disabled={actioningToken === invite.token}
                          className="cursor-pointer flex-1 px-2 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition disabled:opacity-50"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <IoNotifications
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              className='text-teal-900 hover:text-teal-600 duration-300 ease-in-out cursor-pointer'
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">{unreadCount}</span>
            )}
            {notifOpen && (
              <div className="absolute right-0 top-10 bg-white border-2 border-teal-800 rounded-2xl text-base w-80 py-2 z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase">Notifications</span>
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={handleClearAll}
                      className="cursor-pointer text-xs font-medium text-teal-700 hover:text-teal-900"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`cursor-pointer px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-teal-50/50' : ''}`}
                    >
                      <p className="text-sm font-medium text-stone-800">{describeNotification(n)}</p>
                      <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div onClick={() => setNavOpen(!navOpen)} className="relative md:hidden cursor-pointer hover:text-green-600">
            <RiMenu3Fill />
          </div>
        </div>

      </div>

    </header>
  )
}