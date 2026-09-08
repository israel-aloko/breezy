import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LOGOS } from '../assets'
import { Link, useLocation } from 'react-router-dom'
import { FaShoppingCart, FaUser,FaBoxOpen, FaRegHeart } from 'react-icons/fa'
import { RiMenu3Fill } from 'react-icons/ri'
import { logout } from '../features/reducers/authSlice'
import { FiLogOut } from 'react-icons/fi'
import { MdHistory } from 'react-icons/md'
import SearchBar from './SearchBar'
import SearchResultsList from './SearchResultsList'
import { IoNotifications } from 'react-icons/io5'

export default function Header() {
  const dispatch = useDispatch();
  
  const auth = useSelector((state) => state.auth);
  const loggedIn = auth.isAuthenticated;

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    dispatch(logout());
    window.location.href = "/login";
  }

  const location = useLocation();

  const [navOpen, setNavOpen] = useState(false);

  const notifications = useSelector((state) => state.notifications);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0)
      return () => {
        setNavOpen(false)
      }
  }, [location.pathname]);

  const navLinks = [
    { id: "1230", name: 'Projects', path: '/' },
    { id: "1231", name: 'Timeline', path: '/shop' },
    { id: "1232", name: 'About', path: '/about' },
    { id: "1233", name: 'Contact', path: '/contact' },
  ]

  const [results, setResults] = useState([]);

  return (
    <header className="bg-white py-1 md:py-0 fixed top-0 left-0 w-full z-50 shawdow-lg md:border-2 md:border-green-900">
      <div className="container mx-auto px-4 md:px-6 py-2 md:py-2 flex flex-row justify-between items-center gap-4 md:gap-8 box-border">

        <a href="/"><img className='w-[45vw] md:w-[25vw]' src={LOGOS.izzyroots_logo} alt="" /></a>

        <SearchBar setResults={setResults}/>
        <SearchResultsList results={results}/>

        <nav className={`flex flex-col md:flex-row justify-between items-center gap-4 md:gap-9 ${navOpen ? "block absolute top-16 left-0 bg-white w-full border-2 border-green-800" : "hidden md:flex"} md:static md:w-auto md:p-0`}>
          {
            navLinks.map((link) => (
              (link.path === "/contact") ?
                <a className="text-lg font-sm font-semibold hover:text-green-600 duration-300 ease-in-out" key={link.id} href={link.path}>{link.name}</a>
                :
                <Link className="text-lg font-sm font-semibold hover:text-green-600" key={link.id} to={link.path}>{link.name}</Link>
            ))}
        </nav>

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
            <IoNotifications onClick={() => setNotifOpen(!notifOpen)} className='text-teal-900 hover:text-teal-600 duration-300 ease-in-out cursor-pointer' />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">{notifications?.length ?? 0}</span>
            {notifOpen && (
              <div className="absolute right-0 top-10 bg-white border-2 border-teal-800 rounded-2xl text-base w-72 py-2 z-50">
                {notifications && notifications.map((n) => (
                  <div key={n.id} className="px-4 py-2 hover:bg-gray-50">
                    <p className="text-sm font-semibold">{n.text}</p>
                    <p className="text-xs text-gray-500">{n.time}</p>
                  </div>
                ))}
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
