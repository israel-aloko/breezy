import React, { useEffect, useState } from 'react'
import CommentComposer from './commentComposer'
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function CommentThread({ taskId, members, currentUserId }) {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchComments = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/comments`,
                {
                    credentials: 'include',
                })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to load comments')
            setComments(data.comments)
        } catch (error) {
            toast.error(error.message || "Couldn't load comments.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [taskId])

    const childrenByParent = comments.reduce((acc, comment) => {
        const key = comment.parentComment || 'root'

        if (!acc[key]) {
            acc[key] = []
        }

        acc[key].push(comment)

        return acc
    }, {})

    const topLevel = childrenByParent['root'] || []

    const handleNewComment = async ({ content, mentions }) => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, mentions }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to post comment')
            setComments((prev) => [...prev, data.comment])
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleReply = async ({ parentComment, content, mentions }) => {
        try {
            const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/comments`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, mentions, parentComment }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to post reply')
            setComments((prev) => [...prev, data.comment])
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleEdit = async (commentId, content) => {
        try {
            const res = await fetch(
                `${BASE_URL}/api/comments/${commentId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            }
            )

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || 'Failed to edit comment')
            }
            setComments((prev) =>
                prev.map((comment) =>
                    comment._id === commentId
                        ? data.comment
                        : comment
                )
            )
        } catch (error) {
            toast.error(error.message)
        }
    };

    const performDelete = async (commentId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to delete comment')

            const deletedSet = new Set(data.deletedIds || [commentId])
            setComments((prev) => prev.filter((comment) => !deletedSet.has(comment._id)))
            toast.success(
                deletedSet.size > 1 ? 'Comment and its replies deleted' : 'Comment deleted'
            )
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = (commentId) => {
        const replyCount = (childrenByParent[commentId] || []).length

        toast((t) => (
            <div className="flex flex-col gap-2">
                <span className="text-sm text-stone-700">
                    Delete this comment{replyCount > 0 ? ` and its ${replyCount === 1 ? 'reply' : `${replyCount} replies`}` : ''}?
                    This can't be undone.
                </span>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700 px-2 py-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id)
                            performDelete(commentId)
                        }}
                        className="cursor-pointer bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: Infinity })
    }
    return (
        <section className="mt-8">
            <div className="mb-4 flex items-center gap-2">
                <h3 className="text-base font-semibold text-stone-900">
                    Comments
                </h3>
                {comments.length > 0 && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                        {comments.length}
                    </span>
                )}
            </div>

            <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <CommentComposer members={members} onSubmit={handleNewComment}/>
            </div>

            <div className="mt-5">
                {loading ? (
                    <div className="py-6 text-center">
                        <p className="text-sm text-stone-400">
                            Loading comments...
                        </p>
                    </div>
                ) : topLevel.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-stone-200 py-8 text-center">
                        <p className="text-sm font-medium text-stone-500">
                            No comments yet
                        </p>
                        <p className="mt-1 text-xs text-stone-400">
                            Start the conversation about this task.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-200">
                        {topLevel.map((comment) => (
                            <div
                                key={comment._id}
                                className="py-5 first:pt-0 last:pb-0"
                            >
                                <CommentItem
                                    comment={comment}
                                    childrenByParent={childrenByParent}
                                    members={members}
                                    currentUserId={currentUserId}
                                    onReply={handleReply}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
