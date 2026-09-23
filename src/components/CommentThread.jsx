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

    const childrenByParent = comments.reduce((acc, c) => {
        const key = c.parentComment || 'root'
        if (!acc[key]) acc[key] = []
        acc[key].push(c)
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
            const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to edit comment')
            setComments((prev) => prev.map((c) => (c._id === commentId ? data.comment : c)))
        } catch (error) {
            toast.error(error.message)
        }
    }

    const performDelete = async (commentId) => {
        try {
            const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Failed to delete comment')

            const deletedSet = new Set(data.deletedIds || [commentId])
            setComments((prev) => prev.filter((c) => !deletedSet.has(c._id)))
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
        <div>
            <h3 className="text-sm font-semibold text-stone-700 uppercase mb-3">
                Comments {comments.length > 0 && `(${comments.length})`}
            </h3>

            <CommentComposer members={members} onSubmit={handleNewComment} />

            {loading ? (
                <p className="text-xs text-stone-400 mt-4">Loading comments...</p>
            ) : topLevel.length === 0 ? (
                <p className="text-xs text-stone 400 mt-4">No comments yet.</p>
            ) : (
                <div className="mt-2">
                    {topLevel.map((comment) => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            childrenByParent={childrenByParent}
                            members={members}
                            currentUserId={currentUserId}
                            onReply={handleReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
