import { GoogleLogin } from '@react-oauth/google';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom';
import { setUser } from '../features/reducers/authSlice';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/";

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("")
        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Login failed");
                setError(data.message || "Login failed");
                return;
            }

            const userPayload = {
                userId: data.userId,
                fullname: data.fullname,
                role: data.role,
            };

            dispatch(setUser(userPayload))
            localStorage.setItem("loggedInUser", JSON.stringify(userPayload)) // keep only if you were already doing this

            toast.success("Login successful!");

            if (data.role === "admin") {
                navigate("/admin", { replace: true })
            } else {
                navigate(from, { replace: true })
            }

        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (crendentialResponse) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ idToken: credentialResponse.credential }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Google login failed")
                return
            }

            const userPayload = {
                userId: data.userId,
                fullname: data.fullname,
                role: data.role,
            };

            dispatch(setUser(userPayload));
            localStorage.setItem("loggedInUser", JSON.stringify(userPayload));

            toast.success("Login successful!")
            setTimeout(() => {
                navigate(data.role === "ADMIN" ? "/admin/dashboard" : from)
            }, 1500)

        } catch (err) {
            toast.error("Google login failed. Please try again.")
        }
    }

    return (
        <div className="flex flex-col">

            {/* <div className="relative bg-cover bg-center h-[25vh] md:h-[40vh] text-white" style={{ backgroundImage: `url(${BACKGROUNDS.contact_background})` }}>
                <div className="absolute inset-0 bg-black/50">
                    <div className="text-center mt-30 md:mt-25">
                        <h1 className="font-mono text-lg md:text-5xl">Welcome back</h1>
                        <p className="font-mono text-lg md:text-[28px]">Hi there! We missed you. Ready to find some more stuff?</p>
                    </div>
                </div>
            </div> */}

            <div className="flex flex-col items-center mt-5 px-4">

                <div className="p-4">
                    <h1 className="text-center text-2xl text-gray-800 font-semibold">Log in</h1>
                </div>

                {error && (
                    <div className="w-[80vw] md:w-[50vw] bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-2 mb-2 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google login failed")}
                        // width="100%"
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 border-t border-gray-300" />
                    <span className="text-sm text-gray-400">or</span>
                    <div className="flex-1 border-t border-gray-300" />
                </div>

                <div className="flex flex-col">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg w-[80vw] md:w-[50vw]">

                        <div className="flex flex-col">
                            <label className="font-semibold mb-1 text-green-950">Email Address</label>
                            <input type="email"
                                placeholder="marksloan@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold mb-1 text-green-950">Password</label>
                            <input type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                required
                            />
                        </div>
                        <div className="text-right">
                            <a
                                href="/forgot-password"
                                className="text-green-700 hover:underline text-sm"
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <button type="submit" className="cursor-pointer w-full flex items-center justify-center px-6 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white font-bold transition-all">
                            Login
                        </button>

                        <div className="flex flex-row">
                            <h1 className="text-center mt-3 mb-2 text-xl">Don't have an account? <a href="/signup" className="text-center mt-3 mb-2 underline hover:text-green-800 text-xl">Sign up here</a></h1>
                        </div>

                    </form>

                </div>

            </div>

        </div>
    )
}
