import React from 'react'
import { Link } from 'react-router-dom'

export default function ProjectCard({ _id, name, description, deadline, members, owner, isOverdue }) {

  const memberCount = members?.length || 0

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null


  return (
    <Link
      to={`/projects/${_id}`}
      className={`block rounded-lg border p-4 hover:shadow-sm duration-200 ${isOverdue
          ? 'border-red-200 bg-red-50/40 hover:border-red-400/60'
          : 'border-stone-200 hover:border-green-700/40'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-medium text-stone-900">{name}</h2>
        {isOverdue && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
            Overdue
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-sm text-stone-500 line-clamp-2">{description}</p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
        <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        {formattedDeadline && (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            Due {formattedDeadline}
          </span>
        )}
      </div>
    </Link>
  )
}
