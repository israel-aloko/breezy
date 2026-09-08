import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BACKGROUNDS } from '../assets'

export default function VerifyResetCode() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get("email") || ""
    const [otp, setOtp] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const toastId = toast.loading("Verifying...")

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-reset-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            })

            if (res.ok) {
                toast.success("Code verified successfully.", { id: toastId })
                setTimeout(() => {
                    navigate(
                        `/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`
                    );
                }, 1500);
            } else {
                const msg = await res.text()
                toast.error(msg || "Inavlid or expired code.", { id: toastId })
            }
        } catch (err) {
            toast.error("Something went wrong.", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col">
            <div className="relative bg-cover bg-center h-[25vh] md:h-[40vh] text-white" style={{ backgroundImage: `url(${BACKGROUNDS.contact_background})` }}>
                <div className="absolute inset-0 bg-black/50">
                    <div className="text-center mt-30 md:mt-25">
                        <h1 className="font-mono text-lg md:text-5xl">Reset Your Password</h1>
                        <p className="font-mono text-lg md:text-[28px]">We sent a 6-digit code to {email}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center mt-10 px-4">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-[80vw] md:w-[40vw]">
                    <div className="flex flex-col">
                        <label className="font-semibold mb-1 text-green-950">Verification Code</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="border rounded-lg px-4 py-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}
                        className="cursor-pointer w-full px-6 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white font-bold transition-all">
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Didn't receive the code? Check your spam folder or request another password reset.
                        <a href="/forgotpassword" className="underline text-green-800"> Forgot Password</a>.
                    </p>
                </form>
            </div>
        </div>
    )

}
