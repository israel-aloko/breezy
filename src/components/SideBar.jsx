import React, { useEffect, useRef, useState } from 'react'
import { RiMenuFill } from 'react-icons/ri'
import { LOGOS } from '../assets'
import { Link, NavLink } from 'react-router-dom'
import { GoHome } from 'react-icons/go'
import { LuFolderKanban } from 'react-icons/lu'
import { FaRegCalendarAlt, FaTasks } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { CiMenuKebab } from 'react-icons/ci'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: GoHome },
    { to: '/projectdashboard', label: 'Projects', icon: LuFolderKanban },
    { to: '/taskdashboard', label: 'Tasks', icon: FaTasks },
    { to: '/calendar', label: 'Calendar', icon: FaRegCalendarAlt }
];

export default function SideBar() {
    const [navOpen, setNavOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const { fullname, email, profilePicture } = useSelector((state) => state.auth)


    const initials = fullname
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    return (
        <>
            <div
                onClick={() => setNavOpen(!navOpen)}
                className="fixed top-5 left-5 z-50 md:hidden cursor-pointer text-3xl text-[#00242b] hover:text-green-600"
            >
                <RiMenuFill />
            </div>

            <header className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#00242b] text-white shadow-lg
                    transform transition-transform duration-300
                    ${navOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0`}>

                <div className="flex flex-col h-full">
                    <div className="px-6 py-5 border-b border-[#27614a]">
                        <Link to="/homepage"><img className="w-32" src={LOGOS.greenlogo} alt="Logo" /></Link>
                    </div>

                    <nav className="flex flex-col p-4 gap-1 flex-1 overflow-y-auto">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setNavOpen(false)}
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-lg flex items-center gap-3 text-sm transition ${isActive
                                        ? 'bg-[#27614a] text-white font-medium'
                                        : 'text-gray-300 hover:bg-[#012c35] hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="text-lg" /> {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-[#27614a]">
                        <div className="relative" ref={menuRef}>
                            {menuOpen && (
                                <div className="absolute bottom-full mb-2 left-0 right-0 rounded-xl bg-[#012c35] border border-[#27614a] shadow-xl py-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => {setMenuOpen(false)
                                                        setNavOpen(false)
                                        }}
                                        className="block px-4 py-2.5 text-sm hover:bg-[#00242b]"
                                    >
                                        Profile
                                    </Link>
                                    
                                </div>
                            )}

                            <button
                                onClick={() => setMenuOpen((open) => !open)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#012c35] transition text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#27614a] flex items-center justify-center shrink-0 overflow-hidden text-sm font-semibold">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt={fullname} className="w-full h-full object-cover" />
                                    ) : (
                                        initials
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{fullname}</p>
                                    <p className="text-xs text-gray-400 truncate">{email}</p>
                                </div>

                                <CiMenuKebab className="text-lg text-gray-400 shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

        </>
    )
}
