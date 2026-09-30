import React, { useState } from 'react'
import { RiMenuFill } from 'react-icons/ri'
import { LOGOS } from '../assets'
import { Link } from 'react-router-dom'
import { GoHome } from 'react-icons/go'
import { LuFolderKanban } from 'react-icons/lu'
import { FaTasks } from 'react-icons/fa'

export default function SideBar() {
    const [navOpen, setNavOpen] = useState(false)
    return (
        <>
            <div
                onClick={() => setNavOpen(!navOpen)}
                className="fixed top-5 left-5 z-50 md:hidden cursor-pointer text-3xl text-[#00242b] hover:text-green-600"
            >
                <RiMenuFill />
            </div>

            <header className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#00242b] text-white shadow-lg overflow-y-auto
                    transform transition-transform duration-300
                    ${navOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0`}>

                <div className="flex flex-col h-full">
                    <div className="flex flex-col items-center p-6 border-b border-[#27614a]">
                        <a href="/"><img className="w-[12vw]" src={LOGOS.greenlogo} alt="" /></a>
                        {/* <h1 className="text-sm font-bold">
                            MAIN MENU
                        </h1> */}
                    </div>

                    <nav className="flex flex-col p-4 gap-2 flex-1">
                        <Link
                            to="/dashboard"
                            className="px-4 py-3 rounded-lg hover:bg-[#012c35] transition flex items-center gap-3"
                        >
                           <GoHome/> Dashboard
                        </Link>
                        <Link
                            to="/projectdashboard"
                            className="px-4 py-3 rounded-lg hover:bg-[#012c35] transition flex items-center gap-3"
                        >
                           <LuFolderKanban/> Projects
                        </Link>
                        <Link
                            to="/taskdashboard"
                            className="px-4 py-3 rounded-lg hover:bg-[#012c35] transition flex items-center gap-3"
                        >
                           <FaTasks/> Tasks
                        </Link>
                    </nav>
                </div>
            </header>

        </>
    )
}
