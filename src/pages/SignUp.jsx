import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SignUp() {

    const [fullname, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const inviteToken = searchParams.get('invite') // null if not present, e.g. a normal signup

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true)

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        //show loading toast
        const toastId = toast.loading("Creating your account...");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                    fullname,
                    email,
                    password,
                    role: "user", //default role for now.
                    ...(inviteToken && { inviteToken }), // only included when this signup came from an invite link
                }),
            });

            if (response.status === 201) {
                toast.success("A verification code has been sent to your Email!", {
                    id:toastId,
                });

                setTimeout(() => {
                    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                }, 1500);
            } else if (response.status === 409) {
                toast.error("An account with this email already exists.", {
                    id: toastId,
                });
            } else if (response.status === 400) {
                const message = await response.json();
                toast.error(message || "Please check your details and try again.", {
                    id: toastId,
                });
            } else {
                toast.error("Something went wrong. Please try again.", {
                    id: toastId,
                })
            }
        } catch (err) {
            toast.error("Unable to connect to the server. Please try again", {
                id: toastId,
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="flex flex-col">

            {/* <div className="relative bg-cover bg-center h-[25vh] md:h-[40vh] text-white" style={{ backgroundImage: `url(${BACKGROUNDS.contact_background})` }}>
                <div className="absolute inset-0 bg-black/50">
                    <div className="text-center mt-30 md:mt-25">
                        <h1 className="font-mono text-lg md:text-5xl">Let's Grow Together</h1>
                        <p className="font-mono text-lg md:text-[28px]">Hi there! Join our community and grow with us.</p>
                    </div>
                </div>
            </div> */}

            <div className="flex flex-col items-center mt-5 px-4">

                <div className="p-4">
                    <h1 className="text-center text-2xl text-gray-800 font-semibold">Sign Up</h1>
                </div>

                {inviteToken && (
                    <div className="w-[80vw] md:w-[50vw] bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-2 mb-2 text-sm text-center">
                        You're signing up from a project invite. You'll join automatically once verified.
                    </div>
                )}

                <div className="flex flex-col">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg w-[80vw] md:w-[50vw]">

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col">
                            <label className="font-semibold mb-1 text-green-950">Full Name</label>
                            <input type="text"
                                placeholder="Mark Sloan"
                                value={fullname}
                                onChange={(e) => setFullName(e.target.value)}
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                required
                            />
                        </div>

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
                            <span className="text-xs text-gray-500 mt-1">
                                Min 8 characters, with uppercase, lowercase, number & special character.
                            </span>
                        </div>

                        <div className="flex flex-col">
                            <label className="font-semibold mb-1 text-green-950">Confirm Password</label>
                            <input type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                                required
                            />
                        </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer w-full flex items-center justify-center px-6 py-3 rounded-lg bg-green-800 hover:bg-green-700 text-white font-bold transition-all">
                            {/* {loading ? "Creating account..." : "Sign Up"} */}
                            Sign up
                        </button>

                        <div className="flex flex-row">
                            <h1 className="text-center mt-3 mb-2 text-xl">Already have an account?{" "} <a href="/login" className="text-center mt-3 mb-2 underline hover:text-green-800 text-xl">Log in here</a></h1>
                        </div>

                    </form>

                </div>

            </div>

        </div>
    )
}