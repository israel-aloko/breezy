import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BACKGROUNDS } from '../assets'

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get("email") || ""
    const otp = searchParams.get("otp") || ""

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.")
            return
        }
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.")
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.")
            return
        }

        setLoading(true)
        const toastId = toast.loading("Resetting password...")

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, otp, password }),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Unable to reset password.", {
                    id: toastId,
                })
                return
            }

            toast.success("Password reset successful. You can now log in.", {
                id: toastId,
            })

            setTimeout(() => {
                navigate("/login")
            }, 1500)
        } catch (err) {
            toast.error("Something went wrong. Please try again.", {
                id: toastId,
            })
        } finally {
            setLoading(false)
        }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/

    return (
        <div className="flex flex-col">

            <div
                className="relative bg-cover bg-center h-[25vh] md:h-[40vh] text-white"
                style={{
                    backgroundImage: `url(${BACKGROUNDS.contact_background})`,
                }}
            >
                <div className="absolute inset-0 bg-black/50">
                    <div className="text-center mt-30 md:mt-25">
                        <h1 className="font-mono text-lg md:text-5xl">
                            Reset Your Password
                        </h1>

                        <p className="font-mono text-lg md:text-[28px]">
                            Choose a new password for your account.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center mt-10 px-4">

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 w-[80vw] md:w-[40vw]"
                >

                    <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-green-950">
                            New Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-green-950">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full px-6 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white font-bold transition-all disabled:opacity-50"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Remember your password?{" "}
                        <a
                            href="/login"
                            className="underline hover:text-green-800"
                        >
                            Log in
                        </a>
                    </p>

                </form>

            </div>

        </div>
    )
}