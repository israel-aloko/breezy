// import React, { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { LOGOS } from '../assets'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { FaUser } from 'react-icons/fa'
// import { RiMenu3Fill } from 'react-icons/ri'
// import { logout } from '../features/reducers/authSlice'
// import { FiLogOut } from 'react-icons/fi'
// import SearchBar from './SearchBar'
// import SearchResultsList from './SearchResultsList'
// import { IoNotifications } from 'react-icons/io5'
// import toast from 'react-hot-toast'
// import { LuMailPlus } from 'react-icons/lu'

// const BASE_URL = import.meta.env.VITE_API_BASE_URL

// const describeNotification = (n, currentUserId) => {
//   const actorName = n.actor?.fullname || 'Someone'
//   const { type, metadata = {} } = n

//   switch (type) {
//     case 'task_assigned':
//       return metadata.assignedTo === currentUserId
//         ? `${actorName} assigned you to "${metadata.taskTitle}"`
//         : `You were unassigned from "${metadata.taskTitle}"`
//     case 'task_status_changed':
//       return `${actorName} moved "${metadata.taskTitle}" to ${metadata.to}`
//     case 'task_deleted':
//       return `${actorName} deleted "${metadata.taskTitle}"`
//     case 'member_joined':
//       return `${actorName} joined your project`
//     default:
//       return `${actorName} did something`
//   }
// }

// export default function Header() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const auth = useSelector((state) => state.auth);
//   const loggedIn = auth.isAuthenticated;
//   const currentUserId = auth.userId;

//   const handleLogout = () => {
//     localStorage.removeItem("loggedInUser");
//     dispatch(logout());
//     window.location.href = "/login";
//   }

//   const location = useLocation();

//   const [navOpen, setNavOpen] = useState(false);

//   const [notifications, setNotifications] = useState([]);
//   const [notifOpen, setNotifOpen] = useState(false);

//   const [invites, setInvites] = useState([]);
//   const [inviteOpen, setInviteOpen] = useState(false);
//   const [actioningToken, setActioningToken] = useState(null);

//   const fetchInvites = async () => {
//     if (!loggedIn) return;
//     try {
//       const res = await fetch(`${BASE_URL}/api/invites/mine`, {
//         credentials: 'include',
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setInvites(data.invites);
//       }
//     } catch (error) {
//       console.log('Error fetching invites', error);
//     }
//   }

//   const fetchNotifications = async () => {
//     if (!loggedIn) return;
//     try {
//       const res = await fetch(`${BASE_URL}/api/notifications/mine`, {
//         credentials: 'include',
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setNotifications(data.notifications);
//       }
//     } catch (error) {
//       console.log('Error fetching notifications', error);
//     }
//   }

//   useEffect(() => {
//     fetchInvites();
//     fetchNotifications();
//   }, [loggedIn]);

//   const respondToInvite = async (token, action) => {
//     setActioningToken(token);
//     try {
//       const res = await fetch(`${BASE_URL}/api/invites/${token}/${action}`, {
//         method: 'POST',
//         credentials: 'include',
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || `Failed to ${action} invite`);
//       }

//       setInvites(prev => prev.filter(inv => inv.token !== token));

//       if (action === 'accept') {
//         toast.success('Invite accepted');
//         setInviteOpen(false);
//         navigate(`/projects/${data.project._id}`);
//       } else {
//         toast.success('Invite declined');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     } finally {
//       setActioningToken(null);
//     }
//   }

//   // Marks it read (optimistic, so the badge updates immediately without
//   // waiting on the network) then navigates to the relevant page.
//   const handleNotificationClick = async (notification) => {
//     setNotifications(prev =>
//       prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
//     );
//     setNotifOpen(false);

//     try {
//       await fetch(`${BASE_URL}/api/notifications/${notification._id}/read`, {
//         method: 'PATCH',
//         credentials: 'include',
//       });
//     } catch (error) {
//       console.log('Error marking notification as read', error);
//     }

//     const destination = notification.type === 'member_joined'
//       ? `/projects/${notification.project}`
//       : `/projects/${notification.project}/tasks`;

//     navigate(destination);
//   }

//   const handleClearAll = async () => {
//     setNotifications(prev => prev.map(n => ({ ...n, read: true })));

//     try {
//       const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
//         method: 'PATCH',
//         credentials: 'include',
//       });
//       if (!res.ok) throw new Error('Failed to clear notifications');
//     } catch (error) {
//       toast.error(error.message || "Couldn't clear notifications.");
//       fetchNotifications(); // resync on failure since we optimistically updated
//     }
//   }

//   const unreadCount = notifications.filter(n => !n.read).length;

//   useEffect(() => {
//     window.scrollTo(0, 0)
//     return () => {
//       setNavOpen(false)
//     }
//   }, [location.pathname]);

//   const navLinks = [
//     // { id: "1230", name: 'Project', path: '/projectdashboard' },
//     // { id: "1231", name: 'Timeline', path: '/shop' },
//     // { id: "1232", name: 'About', path: '/about' },
//     // { id: "1233", name: 'Contact', path: '/contact' },
//   ]

//   const [results, setResults] = useState([]);

//   return (
//     <header className="bg-white py-1 md:py-0 fixed top-0 left-0 w-full z-50 shawdow-lg md:border-2 md:border-green-900">
//       <div className="container mx-auto px-4 md:px-6 py-2 md:py-2 flex flex-row justify-between items-center gap-4 md:gap-8 box-border">

//         <a href="/"><img className='w-[45vw] md:w-[25vw]' src={LOGOS.izzyroots_logo} alt="" /></a>

//         <SearchBar setResults={setResults} />
//         <SearchResultsList results={results} />

//         <nav className={`flex flex-col md:flex-row justify-between items-center gap-4 md:gap-9 ${navOpen ? "block absolute top-16 left-0 bg-white w-full border-2 border-green-800" : "hidden md:flex"} md:static md:w-auto md:p-0`}>
//           {
//             navLinks.map((link) => (
//               (link.path === "/contact") ?
//                 <a className="text-lg font-sm font-semibold hover:text-green-600 duration-300 ease-in-out" key={link.id} href={link.path}>{link.name}</a>
//                 :
//                 <Link className="text-lg font-sm font-semibold hover:text-green-600" key={link.id} to={link.path}>{link.name}</Link>
//             ))}
//         </nav>

//         <div className="relative">
//           <Link to="/projectdashboard" className="flex items-center bg-green-700 hover:bg-green-800 text-white px-4 rounded-lg transition cursor-pointer">
//             create
//           </Link>
//         </div>

//         <div className="flex flex-row justify-between items-center gap-4 md:gap-8 text-2xl pr-1.5">
//           {!loggedIn ? (
//             <a href="/login">
//               <FaUser className='text-green-900 hover:text-green-600 duration-300 ease-in-out cursor-pointer' />
//             </a>
//           ) : (
//             <>
//               <button
//                 onClick={handleLogout}
//                 className="cursor-pointer flex items-center gap-1 text-green-900 hover:text-red-600 duration-300 ease-in-out"
//               >
//                 <FiLogOut />
//                 <span className="hidden md:inline text-sm">Logout</span>
//               </button>


//             </>
//           )}

//           <div className="relative">
//             <LuMailPlus
//               onClick={() => { setInviteOpen(!inviteOpen); if (!inviteOpen) fetchInvites(); }}
//               className='text-teal-900 hover:text-teal-600 duration-300 ease-in-out cursor-pointer'
//             />
//             {invites.length > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">{invites.length}</span>
//             )}
//             {inviteOpen && (
//               <div className="absolute right-0 top-10 bg-white border-2 border-teal-800 rounded-2xl text-base w-80 py-2 z-50 max-h-96 overflow-y-auto">
//                 {invites.length === 0 ? (
//                   <p className="px-4 py-3 text-sm text-gray-500 text-center">No pending invites</p>
//                 ) : (
//                   invites.map((invite) => (
//                     <div key={invite.token} className="px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0">
//                       <p className="text-sm font-semibold">{invite.project?.name}</p>
//                       <p className="text-xs text-gray-500 mb-2">Invited by {invite.invitedBy?.fullname}</p>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => respondToInvite(invite.token, 'decline')}
//                           disabled={actioningToken === invite.token}
//                           className="cursor-pointer flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
//                         >
//                           Decline
//                         </button>
//                         <button
//                           onClick={() => respondToInvite(invite.token, 'accept')}
//                           disabled={actioningToken === invite.token}
//                           className="cursor-pointer flex-1 px-2 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition disabled:opacity-50"
//                         >
//                           Accept
//                         </button>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="relative">
//             <IoNotifications
//               onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
//               className='text-teal-900 hover:text-teal-600 duration-300 ease-in-out cursor-pointer'
//             />
//             {unreadCount > 0 && (
//               <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">{unreadCount}</span>
//             )}
//             {notifOpen && (
//               <div className="absolute right-0 top-10 bg-white border-2 border-teal-800 rounded-2xl text-base w-80 py-2 z-50 max-h-96 overflow-y-auto">
//                 <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-50">
//                   <span className="text-xs font-semibold text-gray-400 uppercase">Notifications</span>
//                   {notifications.some(n => !n.read) && (
//                     <button
//                       onClick={handleClearAll}
//                       className="cursor-pointer text-xs font-medium text-teal-700 hover:text-teal-900"
//                     >
//                       Clear all
//                     </button>
//                   )}
//                 </div>
//                 {notifications.length === 0 ? (
//                   <p className="px-4 py-3 text-sm text-gray-500 text-center">No notifications</p>
//                 ) : (
//                   notifications.map((n) => (
//                     <div
//                       key={n._id}
//                       onClick={() => handleNotificationClick(n)}
//                       className={`cursor-pointer px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-teal-50/50' : ''}`}
//                     >
//                       <p className="text-sm font-medium text-stone-800">{describeNotification(n, currentUserId)}</p>
//                       <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
//                     </div>
//                   ))
//                 )}
//               </div>
//             )}
//           </div>

//           <div onClick={() => setNavOpen(!navOpen)} className="relative md:hidden cursor-pointer hover:text-green-600">
//             <RiMenu3Fill />
//           </div>
//         </div>

//       </div>

//     </header>
//   )
// }


import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LOGOS } from '../assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RiMenu3Fill } from 'react-icons/ri'
import { logout } from '../features/reducers/authSlice'
import { FiLogOut, FiPlus } from 'react-icons/fi'
import SearchBar from './SearchBar'
import SearchResultsList from './SearchResultsList'
import { IoNotificationsOutline } from 'react-icons/io5'
import toast from 'react-hot-toast'
import { LuMailPlus } from 'react-icons/lu'

import { setNotifications, markOneRead, markAllRead } from '../features/reducers/notificationSlice'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const describeNotification = (n, currentUserId) => {
  const actorName = n.actor?.fullname || 'Someone'
  const { type, metadata = {} } = n

  switch (type) {
    case 'task_assigned':
      return metadata.assignedTo === currentUserId
        ? `${actorName} assigned you to "${metadata.taskTitle}"`
        : `You were unassigned from "${metadata.taskTitle}"`
    case 'task_status_changed':
      return `${actorName} moved "${metadata.taskTitle}" to ${metadata.to}`
    case 'task_deleted':
      return `${actorName} deleted "${metadata.taskTitle}"`

    case 'member_joined':
      return `${actorName} joined ${metadata.projectName || 'your project'}`
    // case 'comment_mention':
    //   return `${actorName} mentioned you in a comment on "${metadata.taskTitle}"`

    case 'comment_mention':
      return `${actorName} mentioned you in a comment on "${metadata.taskTitle}": "${metadata.excerpt}"`
    

    case 'comment_reply':
      return `${actorName} replied to your comment on "${metadata.taskTitle}"`

    case 'comment_added':
      return `${actorName} commented on "${metadata.taskTitle}": "${metadata.excerpt}"`

    case 'join_request_received':
      return `${actorName} requested to join ${metadata.projectName || 'your project'}`
    
    case 'join_request_approved':
      return `${actorName} approved your request to join ${metadata.projectName || 'the project'}`

    case 'join_request_rejected':
      return `Your request to join ${metadata.projectName || 'the project'} was declined`
      
    default:
      return `${actorName} did something`
  }
}

const getNotificationDestination = (n) => {
    switch (n.type) {
      case 'join_request_received':
        return `projects/${n.project}?manage=requests`
      case 'member_joined':
      case 'join_request_approved':
      case 'join_request_rejected':
        return `/projects/${n.project}`
      default:
        return `/projects/${n.project}/tasks`
    }
  }

// Turns a date into "Just now", "5m ago", "2h ago", "3d ago", or "Sep 19"
const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (Number.isNaN(seconds)) return ''
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// hasSidebar is passed in by SidebarLayout: <Header hasSidebar />
export default function Header({ hasSidebar = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const auth = useSelector((state) => state.auth);
  const loggedIn = auth.isAuthenticated;
  const currentUserId = auth.userId;

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    dispatch(logout());
    window.location.href = "/login";
  }

  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);

  // const [notifications, setNotifications] = useState([]);
  const notifications = useSelector((state) => state.notifications.items);

  const [notifOpen, setNotifOpen] = useState(false);

  const [invites, setInvites] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [actioningToken, setActioningToken] = useState(null);

  // Used to detect clicks outside the dropdowns
  const inviteRef = useRef(null);
  const notifRef = useRef(null);

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
        dispatch(setNotifications(data.notifications));
      }
    } catch (error) {
      console.log('Error fetching notifications', error);
    }
  }

  useEffect(() => {
    fetchInvites();
    fetchNotifications();
  }, [loggedIn]);

  // Close the dropdowns when you click outside them or press Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inviteRef.current && !inviteRef.current.contains(e.target)) setInviteOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setInviteOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
    dispatch(markOneRead(notification._id));
    setNotifOpen(false);

    try {
      await fetch(`${BASE_URL}/api/notifications/${notification._id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Error marking notification as read', error);
    }

    // const destination = notification.type === 'member_joined'
    //   ? `/projects/${notification.project}`
    //   : `/projects/${notification.project}/tasks`;

    navigate(getNotificationDestination(notification));
  }

  const handleClearAll = async () => {
    dispatch(markAllRead());

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
      setInviteOpen(false)
      setNotifOpen(false)
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
    // z-30 with a sidebar (sits under the sidebar), z-50 without.
    // md:left-64 pushes the header right by the sidebar's width.
    <header className={`fixed top-0 left-0 right-0 bg-stone-50 border-b border-stone-200 ${hasSidebar ? "z-30 md:left-64" : "z-50"}`}>
      {/* pl-16 on mobile leaves room for the sidebar's hamburger button */}
      <div className={`flex h-16 items-center gap-3 md:gap-4 px-4 md:px-8 ${hasSidebar ? "pl-16 md:pl-8" : ""}`}>

        {/* The sidebar already shows the logo, so only show it on pages without one */}
        {!hasSidebar && (
          <a href="/"><img className="h-8 w-auto" src={LOGOS.izzyroots_logo} alt="" /></a>
        )}

        {/* Desktop nav links (only appear once you add some to navLinks) */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === link.path ? "bg-stone-200/60 text-stone-800" : "text-stone-500 hover:bg-stone-200/60 hover:text-stone-800"}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Wrapper so the search results appear right under the search bar */}
        <div className="relative min-w-0 flex-1 md:max-w-xl">
          <SearchBar setResults={setResults} />
          <SearchResultsList results={results} />
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">

          <Link
            to="/projectdashboard"
            className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition"
          >
            <FiPlus size={16} />
            Create
          </Link>

          {loggedIn ? (
            <>
              {/* Invites */}
              <div ref={inviteRef} className="md:relative">
                <button
                  onClick={() => { setInviteOpen(!inviteOpen); setNotifOpen(false); if (!inviteOpen) fetchInvites(); }}
                  aria-label="Invites"
                  className={`relative grid place-items-center h-10 w-10 rounded-full text-stone-800 hover:bg-stone-200/60 transition cursor-pointer ${inviteOpen ? "bg-stone-200/60" : ""}`}
                >
                  <LuMailPlus size={20} />
                  {invites.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-green-700 text-white text-[11px] font-semibold ring-2 ring-stone-50">
                      {invites.length > 9 ? "9+" : invites.length}
                    </span>
                  )}
                </button>

                {/* On mobile the dropdown stretches across the screen; from md up it hangs under the icon */}
                {inviteOpen && (
                  <div className="absolute left-3 right-3 top-full mt-2 md:left-auto md:right-0 md:w-80 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-stone-200">
                      <h2 className="text-base font-semibold text-stone-800">Invites</h2>
                    </div>

                    {invites.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-stone-800">No pending invites</p>
                        <p className="mt-1 text-xs text-stone-500">When someone invites you to a project, it will show up here.</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {invites.map((invite) => (
                          <div key={invite.token} className="px-4 py-3 border-b border-stone-200 last:border-0">
                            <p className="text-sm font-semibold text-stone-800 truncate">{invite.project?.name}</p>
                            <p className="text-xs text-stone-500 mb-3">Invited by {invite.invitedBy?.fullname}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => respondToInvite(invite.token, 'decline')}
                                disabled={actioningToken === invite.token}
                                className="cursor-pointer flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition disabled:opacity-50"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => respondToInvite(invite.token, 'accept')}
                                disabled={actioningToken === invite.token}
                                className="cursor-pointer flex-1 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition disabled:opacity-50"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div ref={notifRef} className="md:relative">
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setInviteOpen(false); if (!notifOpen) fetchNotifications(); }}
                  aria-label="Notifications"
                  className={`relative grid place-items-center h-10 w-10 rounded-full text-stone-800 hover:bg-stone-200/60 transition cursor-pointer ${notifOpen ? "bg-stone-200/60" : ""}`}
                >
                  <IoNotificationsOutline size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-green-700 text-white text-[11px] font-semibold ring-2 ring-stone-50">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute left-3 right-3 top-full mt-2 md:left-auto md:right-0 md:w-80 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
                      <h2 className="text-base font-semibold text-stone-800">Notifications</h2>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleClearAll}
                          className="cursor-pointer text-xs font-medium text-green-700 hover:text-green-900 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm font-medium text-stone-800">You're all caught up</p>
                        <p className="mt-1 text-xs text-stone-500">Task assignments and project activity will appear here.</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((n) => (
                          <button
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className="cursor-pointer flex w-full items-start gap-3 px-4 py-3 text-left border-b border-stone-200 last:border-0 hover:bg-stone-50 transition"
                          >
                            {/* Green dot = unread */}
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-green-700"}`} />
                            <span className="min-w-0">
                              <span className={`block text-sm ${n.read ? "text-stone-500" : "font-medium text-stone-800"}`}>
                                {describeNotification(n, currentUserId)}
                              </span>
                              <span className="block mt-0.5 text-xs text-stone-500">{timeAgo(n.createdAt)}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Thin divider between the icons and logout (desktop only) */}
              <span className="hidden md:block mx-1 h-6 w-px bg-stone-200" />

              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="cursor-pointer flex items-center gap-2 h-10 px-2.5 md:px-3 rounded-full text-sm font-medium text-stone-800 hover:bg-stone-200/60 transition"
              >
                <FiLogOut size={18} />
                <span className="hidden md:inline">Log out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center h-10 px-4 rounded-lg border border-stone-300 text-sm font-medium text-stone-800 hover:bg-stone-100 transition"
            >
              Log in
            </Link>
          )}

          {/* Mobile menu button: only when there are nav links and no sidebar (the sidebar has its own) */}
          {navLinks.length > 0 && !hasSidebar && (
            <button
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Menu"
              className="md:hidden grid place-items-center h-10 w-10 rounded-full text-stone-800 hover:bg-stone-200/60 transition cursor-pointer"
            >
              <RiMenu3Fill size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {navLinks.length > 0 && !hasSidebar && navOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-full flex flex-col gap-1 px-4 py-3 bg-stone-50 border-b border-stone-200">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === link.path ? "bg-stone-200/60 text-stone-800" : "text-stone-500 hover:bg-stone-200/60 hover:text-stone-800"}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}