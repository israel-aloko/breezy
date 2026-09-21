import React from 'react'
import SideBar from '../components/SideBar'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

export default function SidebarLayout() {
  return (
   <>
    <SideBar/>
    <Header hasSidebar />
    <main className="min-h-screen pt-16 md:ml-64">
        <Outlet />
    </main>
   </>
  )
}
