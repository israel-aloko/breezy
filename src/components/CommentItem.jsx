import React, { useState } from 'react'
import CommentComposer from './commentComposer'

export default function CommentItem({
    comment,
    childrenByParent,
    members,
    currentUserId,
    depth = 0,
    onReply,
    onEdit,
    onDelete,
}) {
    const [collapsed, setCollapsed] = useState(false)
    const [replying, setReplying] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)
    
    const replies = childrenByParent[comment._id] || []
    const isAuthor = comment.author?._id === currentUserId

    const handleReplySubmit = async ({ content, mentions }) => {
        await onReply({ parentComment: comment._id, content, mentions })
        setReplying(false)
    }

    const handleEditSave = async () => {
        if (!editContent.trim() || editContent === comment.content) {
            setEditing(false)
            return
        }
        await onEdit(comment._id, editContent.trim())
        setEditing(false)
    }
    
  return (
    <div style={{ marginLeft: Math.min(depth, 6) * 20 }} className="mt-3">
            <div className="flex gap-2">
                {replies.length > 0 && (
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="cursor-pointer text-stone-400 hover:text-stone-600 text-xs mt-1 flex-shrink-0"
                        aria-label={collapsed ? 'Expand replies' : 'Collapse replies'}
                    >
                        {collapsed ? '▸' : '▾'}
                    </button>
                )}
 
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-stone-800">
                            {comment.author?.fullname || 'Unknown'}
                        </span>
                        <span className="text-xs text-stone-400">
                            {new Date(comment.createdAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            })}
                        </span>
                        {comment.edited && !comment.isDeleted && (
                            <span className="text-xs text-stone-400 italic">(edited)</span>
                        )}
                    </div>
 
                    {editing ? (
                        <div className="mt-1">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={2}
                                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-stone-700 resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex items-center justify-end gap-2 mt-1.5">
                                <button
                                    onClick={() => { setEditing(false); setEditContent(comment.content) }}
                                    className="cursor-pointer text-xs font-medium text-stone-500 hover:text-stone-700 px-2 py-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    className="cursor-pointer bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-green-800"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className={`text-sm mt-0.5 ${comment.isDeleted ? 'italic text-stone-400' : 'text-stone-700'}`}>
                            {comment.content}
                        </p>
                    )}
 
                    {!comment.isDeleted && !editing && (
                        <div className="flex items-center gap-3 mt-1">
                            <button
                                onClick={() => setReplying((r) => !r)}
                                className="cursor-pointer text-xs font-medium text-stone-400 hover:text-green-700 transition"
                            >
                                Reply
                            </button>
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="cursor-pointer text-xs font-medium text-stone-400 hover:text-green-700 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        className="cursor-pointer text-xs font-medium text-stone-400 hover:text-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
 
                    {replying && (
                        <div className="mt-2">
                            <CommentComposer
                                members={members}
                                onSubmit={handleReplySubmit}
                                onCancel={() => setReplying(false)}
                                submitLabel="Reply"
                                placeholder={`Reply to ${comment.author?.fullname || 'this comment'}...`}
                            />
                        </div>
                    )}
                </div>
            </div>
 
            {!collapsed && replies.map((child) => (
                <CommentItem
                    key={child._id}
                    comment={child}
                    childrenByParent={childrenByParent}
                    members={members}
                    currentUserId={currentUserId}
                    depth={depth + 1}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
 
            {collapsed && replies.length > 0 && (
                <button
                    onClick={() => setCollapsed(false)}
                    className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 ml-6 mt-1"
                >
                    {replies.length} {replies.length === 1 ? 'reply' : 'replies'} hidden
                </button>
            )}
        </div>
  )
}
