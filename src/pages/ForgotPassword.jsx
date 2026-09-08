import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BACKGROUNDS } from '../assets'

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const toastId = toast.loading("Sending reset code...")

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Invalid or expired code.", { id: toastId })
                return
            }

            toast.success(
            data.message || "If an account exists for this email, we've sent a verification code.",
            { id: toastId }
        )

            setTimeout(() => {
                navigate(
                    `/verify-reset-code?email=${encodeURIComponent(email)}`
                )
            }, 1500)
        } catch (err) {
            toast.error("Something went wrong. Please try again.", {
                id: toastId,
            })
        } finally {
            setLoading(false)
        }
    }

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
                            Forgot Your Password?
                        </h1>

                        <p className="font-mono text-lg md:text-[28px]">
                            Enter your email address and we'll send you a
                            verification code.
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
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="janineteagues@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer w-full px-6 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white font-bold transition-all disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Code"}
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