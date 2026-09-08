import React, { useState } from 'react'
import Header from './components/Header'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Footer from './components/Footer'
import MainLayout from './layouts/MainLayout'
import { useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import VerifyResetCode from './pages/VerifyResetCode'
import ResetPassword from './pages/ResetPassword'

export default function App() {

  const dispatch = useDispatch();

  function PageLayout() {
    return <>
    <Header />
    <div className="min-h-[80vh]">
      <Outlet/>
    </div>
    <Footer/>
    </>
  }

  const pageRoutes = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout/>,
      children: [
        {
          index: true,
          element: <Homepage />
        },
        {
          path: "login",
          element: <Login/>
        },
          {
            path: "signup",
            element: <SignUp/>
          },
          {
            path: "verify-email",
            element: <VerifyEmail/>
          },
          {
            path: "forgot-password",
            element: <ForgotPassword/>
          },
          {
          path: "verify-reset-code",
            element: <VerifyResetCode/>
          },
          {
          path: "reset-password",
            element: <ResetPassword/>
          },
      ]
    }
  ]);

  return (
    <>
    <Toaster/>
      <RouterProvider router={pageRoutes}/>
    </>
  )
}