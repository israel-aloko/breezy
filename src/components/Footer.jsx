import React from 'react'
import { LOGOS } from '../assets'
import { Link } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa'

export default function Footer() {

  const navLinks = [
    { id: "1230", name: "Home", path: "/" },
    { id: "1231", name: "Create Project", path: "/projectdashboard" },
    { id: "1232", name: "About", path: "/about" },
    { id: "1233", name: "Contact", path: "/contact" },
  ]
  return (
    <footer className="bg-[#00242b] text-white">
      <div className="max-w-6xl mx-auto px-5 md:px-12 py-10 md:py-16">

        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr_1fr] gap-10">


          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/">
              <img
                className="w-36 md:w-44 mb-4"
                src={LOGOS.greenlogo}
                alt="IzzyRoots"
              />
            </Link>

            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Quality seeds for Nigerian soil, sourced and packed with care from
              our farms to your fields.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#7de38d] mb-4">
              Quick Links
            </h3>

            <nav className="flex flex-wrap justify-center md:flex-col gap-x-6 gap-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className="text-sm text-white/80 hover:text-[#7de38d] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Socials */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#7de38d] mb-4">
              Follow Us
            </h3>


            <nav className="flex gap-5 text-2xl md:hidden">
              <a href="" className="hover:text-[#7de38d] transition-colors">
                <FaInstagram />
              </a>

              <a href="" className="hover:text-[#7de38d] transition-colors">
                <FaTiktok />
              </a>

              <a href="" className="hover:text-[#7de38d] transition-colors">
                <FaYoutube />
              </a>

              <a href="" className="hover:text-[#7de38d] transition-colors">
                <FaTwitter />
              </a>
            </nav>

            <nav className="hidden md:flex flex-col gap-3">
              <a
                href=""
                className="flex items-center gap-2 text-sm text-white/80 hover:text-[#7de38d]"
              >
                <FaInstagram /> Instagram
              </a>

              <a
                href=""
                className="flex items-center gap-2 text-sm text-white/80 hover:text-[#7de38d]"
              >
                <FaTiktok /> TikTok
              </a>

              <a
                href=""
                className="flex items-center gap-2 text-sm text-white/80 hover:text-[#7de38d]"
              >
                <FaYoutube /> YouTube
              </a>

              <a
                href=""
                className="flex items-center gap-2 text-sm text-white/80 hover:text-[#7de38d]"
              >
                <FaTwitter /> Twitter
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">

          <p className="text-xs text-center md:text-left text-white/50">
            &copy; {new Date().getFullYear()} IZZY ROOTS. All rights reserved.
          </p>

          <p className="text-xs text-center md:text-right text-white/50 max-w-md">
            8, Sirakoro Str., Off Blantyre Crescent, Wuse 2,
            FCT-Abuja, Nigeria.
          </p>

        </div>
      </div>
    </footer>
  )
}
